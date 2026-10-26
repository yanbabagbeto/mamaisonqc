# MaMaisonQC — Architecture

Status: accepted 2026-10-26 | Owner: Yan Babagbeto
Companion to `docs/PRD.md`. ADRs: `docs/adr/`.

## 1. System shape

Single Next.js 15 (App Router) application, server-rendered, French-only, backed by one SQLite file.
No external services at runtime except one optional outbound call: the MERN Adresses Québec geocoder.

```
browser
  │  HTTPS / RSC payload
  ▼
Next.js app (node runtime)
  ├── app/            routes only (pages, route handlers, server actions) — no business rules
  ├── modules/        domain: valuation, market, owner, premarket, claims, newsletter, geo
  ├── adapters/       db (drizzle+sqlite), geo (MERN REST), clock, mail (outbox)
  ├── shared/         env, errors, money, formatting, provenance
  └── db/             schema + migrations (drizzle-kit)
        │
        ▼
  data/mamaisonqc.db   ← built by pipeline/ (Python ETL) from official open data
```

Dependency rule: `app → modules → (ports) ← adapters`. A module imports only its own files and
`shared/`. Modules never import `db/` directly; they take repository interfaces injected by adapters.
Enforced by `eslint-plugin-import` `no-restricted-imports` rules in `eslint.config.mjs`.

## 2. Module contracts

| Module | Public surface | Depends on |
|---|---|---|
| `modules/valuation` | `estimateProperty(unitId): ValuationResult`, `findComparables(unit, opts)`, `confidenceFor(n)` | property repo (read) |
| `modules/market` | `getRegionStats(regionCode, period?)`, `getMunicipalityStats(code, type?)`, `listCoverage()` | market repo (read) |
| `modules/owner` | `equity(input): EquityResult`, `mortgagePayment(input)` | none (pure) |
| `modules/premarket` | `publishListing(userId, input)`, `recordInterest(...)`, `listOwnedListings(userId)` | listing repo, auth port |
| `modules/claims` | `requestClaim(userId, unitId)`, `approveClaim(adminId, claimId)`, `listClaimsFor(userId)` | claim repo, auth port, audit |
| `modules/newsletter` | `subscribe(email, source)`, `unsubscribe(token)` | subscriber repo, audit |
| `modules/geo` | `searchAddresses(q)` | geo port (MERN) + cache repo |

Money: integer cents everywhere (`value_total_cents`). Percentages as basis points (int).
Formatting: `shared/format.ts` only — `Intl.NumberFormat("fr-CA")`, `Intl.DateTimeFormat("fr-CA")`.

## 3. Contracts (API)

Route handlers under `src/app/api/**`. Every handler: Zod-validated input → `requireSession()` when
auth is needed → ownership check → `AppError` envelope.

Envelope: `{ ok: true, data }` | `{ ok: false, error: { code, message, details? } }`.
Codes: `UNAUTHORIZED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `INVALID_INPUT` 422, `CONFLICT` 409,
`UPSTREAM_UNAVAILABLE` 503, `RATE_LIMITED` 429, `INTERNAL` 500.

Endpoints (v1):
- `GET /api/address/search?q=` → `{ candidates: AddressCandidate[] }` (cached 24 h, 8 max, 3 s upstream timeout)
- `GET /api/evaluation/[matricule]` → `{ unit, estimate, comparables, provenance }`
- `POST /api/claims` (auth) → `{ claim }`, idempotency by `(user_id, property_unit_id)` unique index
- `POST /api/premarket` (auth) → `{ listing }`; `POST /api/premarket/[id]/interets` (public) → `{ interest }`
- `POST /api/newsletter` (public, rate-limited 5/min/IP) → idempotent `{ subscribed: true }`
- `POST /api/consent` → `{ recorded: true }`
- `GET /api/health` → `{ ok, db, rollYear, coverage }`

Server actions are used for same-page form mutations (equity tool, claim, admin moderation) instead of
route handlers when no third party consumes them. Both go through the same Zod schemas in `modules/*/schemas.ts`.

## 4. Trust boundaries

| Boundary | Controls |
|---|---|
| Browser → app | Zod at every boundary; CSRF double-submit for cookie-auth mutations; no secret in client bundle (`shared/env.ts` is server-only; only `NEXT_PUBLIC_*` allowed client-side) |
| app → DB | Parameterized queries via Drizzle; no string SQL; DB file outside web root and git-ignored |
| app → MERN geocoder | Outbound only, 3 s timeout, response size cap, never trust returned HTML; treat response as data |
| user objects (claims, listings, interests) | `WHERE user_id = session.userId` in the repository, asserted in unit tests (AC-6) |
| admin actions | `role === "admin"` checked in the handler; non-admin gets 404 |

Session: opaque random 32-byte token, SHA-256 hashed at rest in `session.id_hash`, `HttpOnly; Secure
(prod); SameSite=Lax; Path=/`, 30-day rolling expiry, revocable by row delete. Passwords: `bcryptjs`
cost 12. No JWT in the browser.

## 5. Failure modes

| Dependency | Timeout | Retry | Degraded behaviour | User message |
|---|---|---|---|---|
| MERN geocoder | 3 s | 1 retry, 250 ms jitter | serve stale cache if <7 days; else empty list | « Recherche d'adresse indisponible. Réessayez ou choisissez une région. » |
| SQLite (read) | n/a | — | 500 with `INTERNAL`, logged with requestId | « Une erreur est survenue. » |
| Valuation (no comparables) | n/a | — | single-point estimate from roll value + range = ±15 %, confidence « faible » | « Données comparables insuffisantes pour ce secteur. » |
| Newsletter/lead write | 2 s | no | queued in `outbox` | « Enregistré. Vous recevrez une confirmation. » |

## 6. Scaling path (rungs, with triggers)

1. **Single instance + SQLite** (today). Trigger to move on: >50 concurrent writers or bot traffic >10 rps.
2. **HTTP cache + query cache** for market/geocoder reads. Trigger: p95 TTFB > 800 ms.
3. **Postgres** (same Drizzle schema, `pg` adapter, one migration run). Trigger: need for concurrent writes,
   or deploy target without a persistent disk.
4. **Static generation of the 4k programmatic pages** at build (`generateStaticParams`) + ISR. Trigger:
   >1,000 market pages or build time >10 min.
5. **Queue for ingest** (worker instead of request time). Trigger: ingest >2 min or scheduled refresh.

## 7. Local run

`pnpm install && pnpm db:build && pnpm dev` — one command boots everything once the data artifact exists.
`pnpm verify` = typecheck + lint + unit + build + e2e. No Docker, no external services required.

## 8. What is deliberately absent

No CMS (content is MDX in `content/`, reviewed in git). No ORM magic beyond Drizzle. No state library
(server components + `useActionState`). No chart library (SVG primitives in `components/charts`). No
analytics vendor (own `consent_event` + `page_view` table behind consent).
