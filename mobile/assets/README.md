# Placeholder assets

These four images are **Expo template placeholders**, not MaMaisonQC branding:

| File | Used by | Final asset |
|---|---|---|
| `icon.png` | iOS app icon, `app.json` `icon` | 1024×1024 PNG, no transparency |
| `splash-icon.png` | splash screen (`expo-splash-screen` plugin) | centred mark on `#FBFAF7` |
| `adaptive-icon.png` | Android adaptive icon foreground | 1024×1024 PNG, safe zone ~66 % |
| `favicon.png` | web favicon (Expo web export only) | 48×48 PNG |

The `design` teammate replaces them in place (same filenames); no code or `app.json` change is
needed. Do not ship to the stores before replacing them.
