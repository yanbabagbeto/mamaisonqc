# MaMaisonQC

Consumer-facing property-value product for Québec, built on **official open data** instead of an
opaque "AI" number. Every figure on screen carries its source, licence and reference date.

See `docs/PRD.md` (product), `docs/ARCHITECTURE.md` (contracts), `docs/adr/` (decisions),
`docs/DATA-CONTRACT.md` (pipeline) and `docs/DATA.md` (what was actually ingested).

## What it does

| Surface | Route | What it answers |
|---|---|---|
| Valuation | `/evaluation/[matricule]` | What a property is worth, with comparables, range and confidence |
| Search | `/recherche` | Find an address (Adresses Québec geocoder) |
| Market | `/marche-immobilier`, `/marche-immobilier/[region]`, `/marche-immobilier/[region]/[municipalite]` | Sales, price bands, mortgages, financial-difficulty deeds by region/municipality |
| Pre-market | `/pre-marche`, `/pre-marche/[id]`, `/pre-marche/publier`, `/tester-le-marche` | Test buyer interest before listing; civic number masked |
| Homeowner | `/proprietaire`, `/proprietaire/equite`, `/proprietaire/hypotheque/[slug]`, `/proprietaire/subventions-renovation` | Equity, refinancing, support programs |
| Account | `/connexion`, `/inscription`, `/proprietaire/tableau-de-bord` | Claim a property page, follow interests |
| Content | `/le-brief`, `/nouvelles`, `/conseils`, `/faq`, `/donnees`, `/conditions`, `/confidentialite`, `/contact` | Method, sources, law, guidance |
| Admin | `/admin/**` | Data coverage, claims, moderation, outbox |
| Bilingual | `…` (fr) and `/en/…` (en) | Same route tree, two languages |

## Stack

Next.js 16 App Router (RSC, route handlers, server actions) · TypeScript strict · Tailwind v4 tokens ·
SQLite + Drizzle ORM · Python ETL for the open-data ingest · Playwright + Vitest + axe-core ·
Expo (React Native) app in `mobile/` for iOS/Android.

Irreversible choices and rejected alternatives: `docs/adr/`.

## Quickstart

```bash
npm install
cp .env.example .env.local        # optional: defaults are fine for local dev
npm run db:migrate                # create data/mamaisonqc.db (schema only)
python3 pipeline/run.py           # ingest official open data -> data/normalized/
npm run db:seed                   # load artifacts into SQLite
npm run dev                       # http://localhost:3000
```

Without the ETL step the app still boots: pages render their designed coverage/empty states instead
of fake numbers. That is a product rule, not an accident.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright against the **production build** on :3100 (run `npm run build` first) |
| `npm run verify` | typecheck + lint + unit + build |
| `npm run db:generate` / `db:migrate` / `db:seed` | Drizzle migrations and artifact loading |
| `npm run create-admin` | Create/refresh an admin account from env |

### Local deployment

This machine runs many other apps, so the deployment script refuses to start on a busy port and
binds to localhost only.

```bash
scripts/serve.sh 3300     # verifies the port is free, checks build + DB, starts detached
scripts/serve.sh stop     # stops it
```

- URL: `http://127.0.0.1:3300` (French) and `http://127.0.0.1:3300/en` (English)
- Log: `serve.log` · PID: `.serve.pid` (both git-ignored)
- Current deployment verified on 3300; ports already taken on this Mac at deploy time: 53, 3000,
  3002, 3773, 4001, 4322, 5000, 5174, 5433, 7000, 7880, 7881, 9230, 51704, 56531, 61608, 65372, 65509.

### Admin access

```bash
ADMIN_EMAIL="you@example.ca" ADMIN_PASSWORD="a-long-dev-password" npm run create-admin
```

Never commit those values; `.env*` is git-ignored.

## Data and method

| Dataset | Publisher | Licence | Used for |
|---|---|---|---|
| Rôle d'évaluation foncière du Québec (2026) | MAMH | CC-BY 4.0 | Roll values, land/building split, area, year built, assessor neighbourhood unit (UMV) |
| Statistiques du Registre foncier | Registre foncier du Québec | CC-BY 4.0 | Sales by price band, mortgages, financial-difficulty deeds |
| Adresses Québec (REST geocoder) | MERN | CC-BY 4.0 | Address search |

- **Method**: comparables within the assessor's own neighbourhood unit (UMV), same use category and
  comparable area; P25–P75 range; confidence derived from the number and dispersion of comparables.
  No opaque "AI model", no invented values.
- **Provenance**: every numeric block renders `<Provenance>` (source, publisher, licence, date).
- **Assumed limits**: the roll value is not a market value; v1 covers a documented subset of
  municipalities; the pre-market is owner-supplied, not MLS.

## Internationalisation

- French at the root, English under `/en/…` (`src/proxy.ts` rewrites and sets `x-maqc-locale`).
- `src/i18n/config.ts` (`localePath`, `htmlLang`) and `src/i18n/server.ts` (`getLocale`, `getMessages`).
- Shared dictionaries: `src/i18n/messages/{fr,en}.ts`; per-domain dictionaries:
  `src/modules/<module>/messages.ts`.
- `hreflang` and `alternates.languages` declared in metadata and in the sitemap.

## Mobile

`mobile/` is an Expo (React Native + expo-router) application for iOS and Android consuming the JSON
API under `/api/mobile/**`. See `mobile/README.md` for simulator/Expo Go flow and the `eas build`
commands (an Apple/Google account is required for store binaries).

## Verification

```bash
npm run verify        # typecheck + lint + unit + production build
npm run build && npm run test:e2e   # Playwright against the production build (routes, bilingual tree, a11y, overflow, auth flows)
```

The e2e suite is written to pass with an empty database (it asserts designed empty states), so a
fresh clone is verifiable before the ETL runs.

## Repository layout

```
src/app/            routes (fr at root, en through the proxy rewrite)
src/components/     ui primitives, layout, domain components, illustrations
src/modules/        domain logic per bounded context (+ colocated tests)
src/db/             drizzle schema, client, seed, csv reader
src/i18n/           locale config, server helpers, dictionaries
src/shared/         format, slug, errors, provenance types
pipeline/           Python ETL (official sources -> data/normalized)
data/               artifacts and SQLite (git-ignored)
docs/               PRD, architecture, ADRs, data contract, data report
tests/e2e/          Playwright specs
mobile/             Expo native app
```

## Licence and attribution

Application code: private. Data: CC-BY 4.0, attributed on every page that renders it and on
`/donnees`. No asset, text or image from a third-party product is reused; all illustration work is
original SVG generated in this repository.
