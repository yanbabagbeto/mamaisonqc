# MaMaisonQC — PRD

Status: draft v1 | Owner: Yan Babagbeto | Updated: 2026-10-26 06:35 America/Toronto

Assumption: `mamaisonqc` is an **independent** product, not a Venture Africa Hub deliverable, so
VAH design tokens are **not** applied. If it is a VAH product, swappable tokens are in
`src/styles/tokens.css` and only that file changes.
Assumption: the delivery target is `github.com/yanbabagbeto/mamaisonqc` (verified empty: 0 commits).
Assumption: no production credentials exist for email, payments, maps or hosting; v1 runs locally
and exports an outbox instead of sending mail.
Assumption: UI and content are **French (Québec)** only.

## 1. Problem & target user

OpenHouseQC proved demand for a consumer-facing "what is my house worth + what is my market"
product in Québec, but its valuation is an opaque "AI" number, its data provenance is invisible,
it gates depth behind account creation, and it ships third-party ad pixels before consent. MaMaisonQC
is a cleaner implementation of the same job, built on **official, auditable Québec open data**:
the municipal assessment roll (`Rôle d'évaluation foncière`, MAMH, CC-BY 4.0), the Registre foncier
market statistics (CC-BY 4.0) and the Adresses Québec geocoder (CC-BY 4.0).

Personas:
- **P1 Sylvie, 48, propriétaire-occupante, Laval.** Mortgage renews in 14 months. Workaround:
  asks neighbours + a random online estimate. Trigger: renewal letter or a broker call.
- **P2 Karim, 34, acheteur actif, Montréal.** Watches listings daily, loses bidding wars.
  Trigger: a targeted neighbourhood he cannot afford yet.
- **P3 Luc, 57, vendeur potentiel dans 6-12 mois.** Wants to test the market without a listing,
  without a broker contract, without his address being public.
- **P4 Yan, courtier hypothécaire (admin).** Wants qualified financing leads from owners who just
  learned their equity position.

## 2. Jobs to be done

- JTBD-1: When I wonder what my property is worth, I want an estimate I can interrogate (which
  comparables, which official value, how fresh), so I can decide whether to renew, refinance or sell.
  Success signal: valuation page reached from search, and "voir mes options de financement" clicked.
- JTBD-2: When I consider selling in a few months, I want to gauge real buyer interest before listing,
  so I can price with evidence. Success signal: pre-market listing published → ≥1 interest recorded.
- JTBD-3: When I shop in a neighbourhood, I want official market numbers per municipality and property
  type, so I can set a realistic budget. Success signal: municipality page → property type filter used.
- JTBD-4: When I own a home and rates move, I want my equity and refinance options computed, so I can
  act before renewal. Success signal: equity tool completed → financing request submitted.
- JTBD-5 (admin): When data is ingested, I want coverage, freshness and licence status visible, so I can
  trust and defend every number on the site. Success signal: admin data page shows 0 stale datasets.

## 3. User flows (happy path + one failure path each)

**F1 Recherche → évaluation**
1. User types ≥3 characters in the address field (home or header).
2. `GET /api/address/search?q=` → Adresses Québec REST geocoder (cached in SQLite, 24 h TTL) returns
   up to 8 candidates (civic number, street, city, postal code, lat/lon).
3. User selects a candidate → `/evaluation/[matricule]` if the address resolves to a seeded roll unit,
   else `/evaluation/adresse?lat=&lon=&adresse=` (address known, roll unit not covered).
4. Page renders: official roll value (`RL0404A`), prior-roll value (`RL0405A`), land/building split,
   comparable set (same municipality + same assessor neighbourhood unit `RL0107A` + same CUBF class +
   area within ±25 %), estimate range (P25–P75), confidence label, every figure with source + date.
5. CTA "Voir mes options de financement" → `/proprietaire/equite?matricule=…`.
F1.fail: geocoder unreachable or 0 candidates → inline message "Adresse introuvable — vérifiez le numéro
et la municipalité", manual fallback link to `/marche-immobilier`; the page never renders a fake address.

**F2 Réclamer sa page**
1. `/reclamer-ma-page?matricule=…` → form (email, password, name) → account created, `claim` row `pending`.
2. Admin approves in `/admin/reclamations` → audit event written.
3. Owner sees `/proprietaire/tableau-de-bord` scoped to **their** claimed units only.
F2.fail: duplicate claim for the same unit → `409`, message "Cette page est déjà réclamée", no account
mutation.

**F3 Publier un pré-marché**
1. Authenticated owner opens `/pre-marche/publier`, picks one of their claimed units, sets asking price
   (integer cents), horizon, description ≤ 600 chars, visibility (`prive` | `acheteurs_verifies`).
2. Listing stored `actif`; appears in `/pre-marche` with a mask (street + city only, never civic number).
3. Buyer clicks "Je suis intéressé" → `premarket_interest` row (name, email, message), owner notified in
   their dashboard (no email sent in v1; row is visible in `/proprietaire/tableau-de-bord/interets`).
F3.fail: owner tries to publish for a unit they do not own → `403`, nothing written.

**F4 Marché**
1. `/marche-immobilier` lists the 17 administrative regions with real aggregate stats from the Registre
   foncier (sales count by price band, mortgage registrations, financial-difficulty acts).
2. `/marche-immobilier/[region]` lists covered municipalities + roll-derived inventory.
3. `/marche-immobilier/[region]/[municipalite]?type=` filters by property type (unifamiliale,
   copropriété, plex) and shows price-band distribution + assessment-value distribution.
F4.fail: a municipality with no ingested roll → page renders region stats + an explicit coverage notice
("rôle non ingéré pour ce territoire"), never zeros presented as facts.

**F5 Propriétaire**
1. `/proprietaire` hub → hypotheque pages, subventions, outil d'équité.
2. `/proprietaire/equite` computes equity from: claimed roll value (or manual entry), mortgage balance,
   rate, amortization → payments, equity, refinance headroom.
F5.fail: missing values → inline field errors, no result card, no guessed defaults.

**F6 Le Brief (newsletter)**
1. Email submitted in footer/section → `newsletter_subscriber` row with consent timestamp + source.
2. Confirmation page + unsubscribe token link (`/le-brief/desinscription?token=`).
F6.fail: duplicate email → idempotent success message, no duplicate row.

**F7 Admin**
1. `/admin` (role `admin` only): data coverage, freshness, licence attribution, claims queue, listings
   moderation, outbox (mail/leads).
F7.fail: non-admin session → 404 on `/admin` routes (not 403, to avoid route disclosure).

## 4. Data model sketch

All money as integer cents (`*_cents`), all timestamps `TEXT` ISO-8601 UTC.

| Entity | Key fields | Relations | Indexes | Owner |
|---|---|---|---|---|
| `territory` | `code_geo` (PK), `name`, `level` (province/region/mrc/municipalite), `parent_code` | self FK `parent_code` | `(level, name)`, `(parent_code)` | — public |
| `property_unit` | `id` PK, `municipality_code`, `matricule`, `umv`, `cubf`, `addr_no`, `addr_street`, `addr_suite`, `land_area_m2`, `frontage_m`, `year_built`, `floors`, `value_land_cents`, `value_building_cents`, `value_total_cents`, `value_prior_cents`, `market_ref_date`, `roll_year`, `source_url` | → territory(code_geo) | `(municipality_code, umv, cubf)`, `(address_street, addr_no)`, unique `(municipality_code, matricule)` | — public |
| `market_stat` | `id` PK, `period` (YYYY-MM), `region_code`, `municipality_code?`, `kind` (ventes/hypotheques/difficultes), `price_band`, `count` | → territory | `(region_code, period, kind)`, `(municipality_code, period)` | — public |
| `valuation_snapshot` | `id` PK, `property_unit_id`, `estimate_cents`, `low_cents`, `high_cents`, `confidence`, `comparables_count`, `model_version`, `created_at` | → property_unit | `(property_unit_id, created_at)` | — public |
| `user` | `id` PK, `email` unique, `password_hash`, `name`, `role` (owner/admin) | — | unique `(email)` | self |
| `session` | `id` PK, `user_id`, `expires_at` | → user | `(user_id)`, `(expires_at)` | owner |
| `claim` | `id` PK, `user_id`, `property_unit_id`, `status` (pending/approved/rejected), `evidence`, `created_at` | → user, property_unit | unique `(user_id, property_unit_id)`, `(status)` | **user_id** |
| `premarket_listing` | `id` PK, `user_id`, `property_unit_id`, `asking_price_cents`, `horizon`, `description`, `visibility`, `status`, `created_at` | → user, property_unit | `(user_id)`, `(status, created_at)` | **user_id** |
| `premarket_interest` | `id` PK, `listing_id`, `name`, `email`, `message`, `status`, `created_at` | → listing | `(listing_id, created_at)` | **listing.user_id** via join |
| `newsletter_subscriber` | `id` PK, `email` unique, `consent_at`, `source`, `unsubscribe_token`, `unsubscribed_at` | — | unique `(email)` | self |
| `consent_event` | `id` PK, `session_key`, `choice`, `policy_version`, `created_at` | — | `(created_at)` | — |
| `audit_event` | `id` PK, `actor_id?`, `action`, `entity`, `entity_id`, `payload_json`, `created_at` | → user | `(entity, entity_id)`, `(created_at)` | — |
| `outbox` | `id` PK, `kind` (mail/lead), `to_email`, `subject`, `body`, `status`, `created_at` | — | `(status, created_at)` | — |

Rules: `claim`, `premarket_listing`, `premarket_interest` are read **only** through
`WHERE user_id = session.userId` (ownership check in the module, not in the layout). Every state
change on claim/listing/interest writes one `audit_event`.

## 5. Acceptance criteria

- AC-1 Given a seeded matricule, when `/evaluation/[matricule]` loads, then the total roll value shown
  equals `property_unit.value_total_cents / 100` formatted `fr-CA`, and the page displays the source
  name, licence and reference date.
- AC-2 Given the same page, when comparables render, then each comparable is from the same
  `municipality_code` and the same `umv`, and the count shown equals the returned array length.
- AC-3 Given a valid address query, when `/api/address/search?q=1234 rue Sainte-Catherine` is called,
  then it returns 200 with `candidates[]` where each item has `label`, `city`, `lat`, `lon`, in ≤ 2000 ms
  (warm cache) and the response is cached for 24 h.
- AC-4 Given a query with no match, when search runs, then the UI shows the "adresse introuvable" message
  and no candidate list, and `/api/address/search` returns 200 with `candidates: []`.
- AC-5 Given an unauthenticated visitor, when they POST `/api/premarket` for a unit, then the response is
  401 and no row is written.
- AC-6 Given user A owns listing L and user B is authenticated, when B GETs
  `/proprietaire/tableau-de-bord/interets`, then L's interests are absent from B's payload (ownership,
  not just role).
- AC-7 Given a duplicate email signup, when POST `/api/newsletter` runs twice, then the second call is 200
  idempotent and `newsletter_subscriber` still has exactly one row for that email.
- AC-8 Given any market page, when it renders a figure, then the figure is accompanied by a provenance
  block naming the dataset, its licence and its refresh date; a page with no data renders the coverage
  notice instead of zeros.
- AC-9 Given the app in production build, when `/marche-immobilier/[region]` is requested for a seeded
  region, then the response is rendered on the server (HTML contains the region name without JS).
- AC-10 Given the sitemap is requested, then it lists every published market, content and legal route,
  and each entry's `<lastmod>` is a valid ISO date.
- AC-11 Given a non-admin session, when `/admin` is requested, then the response status is 404.
- AC-12 Given a pre-market listing, when it renders publicly, then the civic number is absent from the
  HTML and only street name + city are shown.
- AC-13 Given the equity tool, when mortgage balance > estimate, then it renders negative equity with the
  exact difference and no refinance CTA.
- AC-14 Given a 375 px viewport, when any primary page renders, then `document.scrollWidth <= 375` and no
  element overflows (no horizontal scroll).
- AC-15 Given a keyboard-only user on the address search, when they type, Tab to the list, Enter, then
  the valuation page opens; the focused element always has a visible ring.
- AC-16 Given axe-core on `/`, `/evaluation/[matricule]`, `/marche-immobilier`, `/proprietaire/equite`,
  then there are 0 violations of impact `serious` or `critical`.
- AC-17 Given `pnpm verify` on a clean checkout, then typecheck, lint, unit tests, and `next build` all
  exit 0, and the e2e happy path (F1, F3, F6) passes.
- AC-18 Given the invoice-free rule, when any page displays a copied figure, then it carries
  `data-provenance`; no number on the site exists without a stored source row (checked by a unit test
  over the attribution map).

## 6. Non-goals (v1 will NOT do)

- No verbatim copy of OpenHouseQC's text, images, iconography, brand or layout; we replicate the
  **jobs**, not their copyrighted expression. Independent visual identity.
- No scraping of OpenHouseQC, Centris or any MLS data.
- No ingest of the full 1,134-municipality roll (≈ >10 GB of XML); v1 ships a documented, re-runnable
  pipeline and a curated multi-city subset.
- No "AI/LLM valuation". The model is a transparent statistical estimator over official data; the site
  says so.
- No real email delivery, no payments, no SMS, no push.
- No mobile app, no public API for third parties, no multi-language.
- No user-uploaded documents in v1 (claim evidence is a short text field only).

## 7. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Roll XML is large; ingest too slow to demo | High | Medium | Cap units per municipality; stream-parse; store SQLite artifact commit-free; document scale path | data |
| Wrong field mapping (`RL*` codes) | Medium | High | Validate against MAMH guide + spot-check ≥5 properties per city against the official PDF/roll | data |
| Geocoder rate-limit / downtime | Medium | Medium | SQLite cache (24 h), 3 s timeout, degraded message | valuation |
| Licence/attribution breach (CC-BY 4.0) | Low | High | Provenance table + visible attribution + `/donnees` page | lead |
| Loi 25 (Québec privacy) exposure | Medium | High | Consent-first analytics only, data minimization, privacy page, export/delete on request | lead |
| Scope creep across 7 sections | High | High | MVP cut below; each section has explicit depth | lead |
| Own numbers mistaken for official government figures | Medium | High | Every figure labelled "données officielles, estimation MaMaisonQC" where derived | lead |
| Native dep (`better-sqlite3`) build break | Low | Medium | Verified installs on this machine (Node 26/arm64); fallback to `node:sqlite` documented | lead |

## 8. MVP cut

Must ship (all ACs): data pipeline + SQLite artifact for ≥5 municipalities; address search + valuation
page with comparables and provenance; region + municipality market pages for covered territories; owner
hub with equity tool; mortgage pages (6); subsidy pages (verified sources only); pre-market publish +
interest capture; claim flow; auth; Le Brief subscribe; FAQ; legal (conditions, confidentialité, `/donnees`);
admin data + moderation; sitemap/robots; French copy throughout.

Should ship: 6 original articles (conseils/nouvelles), brief archive with 1 real edition, SVG charts,
dark mode.

Cut to v2 (must not be blocked by v1 seams): full province ingest, quartier-level pages, email delivery,
Postgres/deploy, mortgage prequalification calculator with lender rules, saved searches, alerts.

## 9. Open decisions

| Question | Options | Default if unanswered | Deadline |
|---|---|---|---|
| Deploy target at launch | Vercel + hosted PG / VPS + SQLite | Local + GitHub push only | v2 |
| Broker lead routing | In-app admin outbox / CRM webhook | Admin outbox | v2 |
| Quartier granularity | Roll UMV aggregation / none | None | v2 |
| Real email provider | Resend / Postmark | Outbox only | v2 |

## Changelog

- 2026-10-26 Initial spec from OpenHouseQC recon + verified open-data sources.
