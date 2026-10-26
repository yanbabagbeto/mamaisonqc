# MaMaisonQC — native app (iOS + Android)

The native surface of MaMaisonQC, built with **Expo** (React Native + TypeScript + expo-router).
It consumes the same JSON API as the web app and shows the same official-data figures, in French
or English.

- `app/` — expo-router routes: five tabs (Accueil, Marché, Pré-marché, Propriétaire, Paramètres)
  plus three stacked detail screens (Évaluation, Région, Annonce pré-marché).
- `src/api/` — typed client + one function per endpoint (`client.ts`, `endpoints.ts`, `types.ts`).
- `src/i18n/` — full FR and EN dictionaries; `en.ts` is annotated with the type derived from
  `fr.ts`, so a missing/extra key fails `tsc`.
- `src/theme/tokens.ts` — the web design language ported to native (green `#1D5B4F`,
  paper `#FBFAF7`, ink `#12181F`, rounded cards, airy spacing, 44 pt touch targets).
- `src/components/` — shared primitives (`ui.tsx`) and the provenance block (`provenance.tsx`).
- `src/lib/` — locale-aware formatting, the equity finance mirror, labels, async hook.

The JSON endpoints it calls live in the web app under `src/app/api/mobile/**` (see "API
endpoints" below).

## Prerequisites

- Node.js 20+ and npm (verified here with Node 26 / npm 11).
- The **web app running** (it owns the database and the API):
  `npm install && npm run db:build && npm run dev` at the repository root → `http://localhost:3000`.
- For the iOS simulator: Xcode + an iOS simulator (macOS only).
- For the Android emulator: Android Studio + an AVD.
- Or a physical phone with the **Expo Go** app (same Wi-Fi as the Mac).

## Install and run

```bash
npm install                      # from repo root once, then:
npm --prefix mobile install      # installs the native app dependencies
```

Start the Expo dev server (from `mobile/`):

```bash
npx expo start          # QR code for Expo Go
npx expo start --ios    # iOS simulator (macOS)
npx expo start --android # Android emulator
```

### API base URL

The client reads `EXPO_PUBLIC_API_URL` and falls back to `http://localhost:3000`:

```bash
# iOS simulator and web: localhost is the Mac itself
EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start --ios

# Android emulator: 10.0.2.2 is the host machine from inside the emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 npx expo start --android

# Physical phone (Expo Go): the Mac's LAN IP — not localhost, which is the phone itself
ipconfig getifaddr en0   # e.g. 192.168.1.42
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000 npx expo start
```

`EXPO_PUBLIC_*` variables are inlined by Expo at build time: restart the dev server (with `-c` to
clear the cache if needed) after changing them. The current effective URL is visible in
**Paramètres → Service de données**.

### Quality checks

```bash
npm --prefix mobile run typecheck   # tsc --noEmit, strict + noUncheckedIndexedAccess
npm --prefix mobile test            # Node's test runner: finance mirror + API client
npx expo-doctor                     # dependency/config diagnostics (run inside mobile/)
```

## API endpoints consumed

All responses use the web envelope `{ ok: true, data }` / `{ ok: false, error }`
(`src/shared/errors.ts`). The native client unwraps `data`, applies an 8 s timeout and maps
failures to localized codes (`OFFLINE`, `TIMEOUT`, `NOT_FOUND`, …).

| Screen | Endpoint |
|---|---|
| Accueil address search | `GET /api/address/search?q=` (web endpoint) |
| Évaluation | `GET /api/mobile/evaluation/[matricule]` |
| Marché list | `GET /api/mobile/regions` |
| Marché region detail | `GET /api/mobile/regions/[code]` |
| Pré-marché list | `GET /api/mobile/premarket` |
| Pré-marché detail | `GET /api/mobile/premarket/[id]` |
| Pré-marché interest form | `POST /api/mobile/premarket/[id]/interets` |

The mobile endpoints are read-only projections of the domain modules
(`@/modules/valuation`, `@/modules/market`, `@/modules/premarket`); the interest POST reuses the
web `interestSchema` and `recordInterest`, so native and browser writes are identical. Addresses
of pre-market listings are masked by the domain module (street + city, never the civic number).

## Icons and splash (placeholders)

`assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png` and `assets/favicon.png`
are **template placeholders** copied from the Expo scaffold. The `design` teammate delivers the
real MaMaisonQC icons later; replacing these four files (same names, 1024×1024 for `icon.png`) is
the only change needed — `app.json` already points at them.

## Store builds (not run here — no Apple/Google account)

EAS builds produce the store binaries. An Apple Developer account (iOS) and a Google Play Console
account (Android) are required, plus `npx eas login`:

```bash
npm install -g eas-cli
eas login
cd mobile

# iOS: App Store binary (.ipa) — requires an Apple Developer Program membership
eas build -p ios --profile production

# Android: Play Store binary (.aab) — requires a Google Play Console account
eas build -p android --profile production

# Local simulators/emulators (no account):
eas build -p ios --profile preview --local
eas build -p android --profile preview --local
```

`eas.json` is **not included yet**: add it with `eas build:configure` when the accounts exist.
Bundle identifiers are already set in `app.json` (`ca.mamaisonqc.app` for both platforms).
