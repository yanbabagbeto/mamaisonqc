# MaMaisonQC — original image system

**Status:** components shipped, not yet wired into pages (the Lead owns page edits).
**Owner:** design workstream (shared task `task-6`).
**Scope:** `src/components/illustrations/**`, `public/icons/**`, `src/app/opengraph-image.tsx`,
`src/app/icon.svg`, `src/app/apple-icon.png`, `src/app/manifest.ts`, this file and
`docs/assets-preview.html`.

The image system that serves every image slot in the product is **original, code-drawn SVG**. There is no photograph,
no stock asset, no AI render, no 3D icon and no file from `openhouseqc.com`. This document is the
slot inventory, the integration contract and the record of what was visually verified.

---

## 1. Constraints and design intent

| Constraint | How it is met |
| --- | --- |
| No copied assets, ever | All geometry is authored in this repository. `rg "href=|src=|@import|base64"` over the illustration sources returns nothing; the only URL is the required `xmlns` namespace. |
| Bilingual product, so no baked text | No `<text>`, `<tspan>` or `<foreignObject>` in any asset. Copy always comes from the component next to the drawing. |
| Self-contained | No external fonts, no external images, no CSS variables inside the SVG. Literal colours from `palette.ts`; `viewBox` on every file. |
| Airy, warm, editorial | ~60 % sky in the hero, flat layered strata, one warm sun, generous negative space, no gradients, no blur, no drop-shadow stacks. |
| Tiny and crisp | Hero ≈ **4.2 KB** rendered SVG (budget: < 60 KB). Features 0.5 KB, regions 1.4–3.1 KB, properties 2.5 KB, phone 4.4 KB, empty states 1.0 KB. |
| Deterministic | Region scenes are seeded by the region code (FNV-1a → mulberry32). Same code → same drawing; no hydration drift, no layout shift. |
| Accessible by default | Decorative (`aria-hidden`, `focusable="false"`) unless a `title` is passed, in which case `role="img"` + `<title>`. The page keeps the real heading/label as text. |

---

## 2. Palette

Tokens come from `src/app/globals.css` and are **not redefined**: primary `#1D5B4F`,
primary-strong `#14453C`, primary-soft `#E7F0ED`, accent `#A84E1C`, accent-soft `#FBEEE6`,
ink `#12181F`, paper `#FBFAF7`, white `#FFFFFF`.

Six secondary hues are defined in `src/components/illustrations/palette.ts`, plus lighter/darker
tints of the same hues (not new hues). That is the documented maximum.

| Secondary hue | Hex | Role in the artwork | Tints |
| --- | --- | --- | --- |
| mist | `#E6EEEA` | atmospheric haze, northern sky, glass | `mistPale #F1F5F2`, `mistDeep #D5E3DC` |
| sage | `#A9C2B6` | foliage, meadow, hedges | `sagePale #C4D6CB`, `sageDeep #7F9E8D` |
| clay | `#C97B4E` | timber gable, tree trunks, cliffs, silos | `clayPale #E8CEB6`, `clayDeep #A9613B` |
| sand | `#F1E6D6` | ground, paths, quay, fields | `sandPale #F7F1E7`, `sandDeep #E2D3BE` |
| slate | `#4B5A64` | glazing, asphalt, rock, downtown tower | `slatePale #93A3AC` |
| ochre | `#D9A441` | sun, warm interior light, doors on the app icon | `ochrePale #F0DDB8` |

Contrast of the text pairs that sit next to these drawings (computed, WCAG AA needs 4.5:1):

| Pair | Ratio |
| --- | --- |
| ink on paper | 17.11:1 |
| ink-soft on paper | 9.19:1 |
| primary on paper | 7.56:1 |
| accent on paper | 5.33:1 |
| white on primary | 7.89:1 |
| white on accent | 5.67:1 |
| primary-strong on primary-soft | 9.29:1 |

No illustration conveys meaning by colour alone; every slot has adjacent text in the page.

---

## 3. Slot inventory

### 3.1 Page-level slots

| Slot / page | Purpose | Component | Dimensions | Integration notes |
| --- | --- | --- | --- | --- |
| Home hero | Give the value proposition a calm, local image instead of a listing photo | `<HeroHouseScene />` | `viewBox 0 0 800 560`, default 800×560 | Decorative next to the `<h1>`. Suggested wrapper: `max-w-md`/`max-w-lg`, `className="h-auto w-full"`. Proven at 375 px and 1440 px. |
| Pre-market section / `/pre-marche` | Show what the pre-market experience looks like without inventing a listing | `<PreMarketPhone />` | `viewBox 0 0 320 600`, default 320×600 | Wordless UI shapes only: no prices, names or addresses. Tilted −3° inside its own viewBox. `className="mx-auto h-auto w-full max-w-[16rem]"`. |
| Open Graph / social | Share card, 1200×630 | `src/app/opengraph-image.tsx` (next/og) | 1200×630 PNG | Automatic through the file convention. Bundled Geist font, **no external font fetch**; hierarchy from size/colour (the bundled face has no bold weight). |
| Browser favicon | Mark in the tab | `src/app/icon.svg` | 64×64, rounded square | Automatic. Vector, 0.4 KB. |
| iOS home screen | Apple touch icon | `src/app/apple-icon.png` | 180×180 PNG | Real PNG rendered from the SVG master (not a renamed SVG). Automatic. |
| PWA install, any | Home-screen / task switcher | `public/icons/icon-192.png`, `icon-512.png` | 192×192, 512×512 PNG | Declared in `manifest.ts`. Full-bleed primary square; the OS applies its own mask. |
| PWA install, maskable | Android adaptive icon | `public/icons/icon-512-maskable.png` | 512×512 PNG | Mark kept inside the 80 % safe circle (`scale(1.1)` of the base mark at 1024). Declared as `purpose: "maskable"`. |
| Web app manifest | Install metadata | `src/app/manifest.ts` | — | name, short_name, `lang: "fr"`, `start_url: "/"`, `display: "standalone"`, theme `#1D5B4F`, background `#FBFAF7`, three PNG icons. |

> `public/icons/icon-master.svg` and `icon-maskable-master.svg` are the two 1024×1024 sources used to
> rasterise the PNG set. They stay in `public/` so the icons can be regenerated without design tools.

### 3.2 Feature illustrations (6)

Page intent: the "Par où commencer" cards on the home page and the six mortgage/owner service pages.
All are 160×160 medallions, decorative by default, readable at 48 px.

| Slot | Purpose | Kind | Import | Notes |
| --- | --- | --- | --- | --- |
| Vendre | Handing over the keys | `vendre` | `<FeatureIllustration kind="vendre" />` or `<FeatureVendre />` | Accent-soft medallion, primary key, warm key tag. |
| Acheter | A home that holds a heart | `acheter` | `… kind="acheter"` / `<FeatureAcheter />` | Primary-soft medallion. |
| Financement | Certificate of financing | `financement` | `… kind="financement"` / `<FeatureFinancement />` | Primary-soft medallion, wax seal in accent. |
| Hypothèque | Rate | `hypotheque` | `… kind="hypotheque"` / `<FeatureHypotheque />` | Percent sign + falling-rate badge. |
| Assurance | Protection | `assurance` | `… kind="assurance"` / `<FeatureAssurance />` | Shield with a small house. |
| Rénovation | Tools | `renovation` | `… kind="renovation"` / `<FeatureRenovation />` | Paint roller with one warm stroke. |

Suggested sizes: `className="size-14"` in a card header, `size-16`–`size-20` on a service page.
`FEATURE_TITLES` exports short French alt text for the rare slot where the drawing is the only content.

### 3.3 Region scenes (17)

Page intent: `/marche-immobilier` region cards and region landing pages. All are 320×200 (16:10),
decorative by default; the region name must stay as page text.

| Code | Region | Terrain | Deterministic motif | Dimensions |
| --- | --- | --- | --- | --- |
| 01 | Bas-Saint-Laurent | fleuve | Low far shore, sailboat, gulls | 320×200 |
| 02 | Saguenay–Lac-Saint-Jean | lac | Dock, pine shoreline, lake ripples | 320×200 |
| 03 | Capitale-Nationale | fleuve | Far-shore skyline and a ferry crossing | 320×200 |
| 04 | Mauricie | forêt | Boreal ridges, river between them | 320×200 |
| 05 | Estrie | montagne | Two sharp snow-capped peaks | 320×200 |
| 06 | Montréal | urbain | Downtown skyline, dark tower, street lamp | 320×200 |
| 07 | Outaouais | forêt | Rock cut, river, canoe | 320×200 |
| 08 | Abitibi-Témiscamingue | forêt | Flat boreal band, clearing, low sun | 320×200 |
| 09 | Côte-Nord | côte | Lighthouse on the right-hand rock | 320×200 |
| 10 | Nord-du-Québec | nord | Aurora bands, stars, snow, sparse firs | 320×200 |
| 11 | Gaspésie–Îles-de-la-Madeleine | côte | Red cliff on the left, two wind turbines | 320×200 |
| 12 | Chaudière-Appalaches | montagne | Rounded Appalachian ridges, orchard row | 320×200 |
| 13 | Laval | urbain | Low-rise suburbia, pitched roofs, park | 320×200 |
| 14 | Lanaudière | lac | Pine island in the lake, sailboat, reeds | 320×200 |
| 15 | Laurentides | montagne | Three peaks and a snow-filled ski run | 320×200 |
| 16 | Montérégie | fleuve | Orchard rows above the river | 320×200 |
| 17 | Centre-du-Québec | fleuve | Two silos, field lines, rowboat | 320×200 |

`REGIONS` exports `{ code, slug, name, terrain }`; `getRegion("6")` normalises to `"06"`.
`regionVariant("03")` returns the rank inside the terrain family, which is what selects the motif.
Unknown codes fall back to the St. Lawrence scene (never throws).

Suggested integration:
`<RegionScene code={region.code} className="aspect-[16/10] h-auto w-full rounded-xl" />`
(or the actual `code` field from the market module). Rounded corners come from the wrapper, not the SVG.

### 3.4 Property type thumbnails (5)

Page intent: `/pre-marche` and `/recherche` listing card media. 280×180 (14:9), warm paper backdrop.

| Slot | Purpose | Kind | Notes |
| --- | --- | --- | --- |
| Unifamiliale | Detached house with yard | `unifamiliale` | Pitched roof, tree, walkway. |
| Plex | Québec walk-up with **exterior staircase** | `plex` | Three doors, exterior stair with railing — the local housing marker. |
| Copropriété | Condo tower | `copropriete` | Balcony grid, one warm door. |
| Terrain | Vacant lot | `terrain` | Survey stakes, dashed lot line, blank for-sale board. |
| Commercial | Storefront | `commercial` | Striped awning, blank sign board, two display windows. |

`<PropertyTypeThumb type="plex" className="h-auto w-full" />` in an `aspect-[14/9]` media slot.
`PROPERTY_TYPE_LABELS` has French alt text if a labelled image is ever needed.

### 3.5 Empty states (4)

| Slot | Reason named | Kind | Notes |
| --- | --- | --- | --- |
| Recherche sans résultat | aucun résultat | `no-results` | Magnifier over a dashed, empty lens. |
| Aucune annonce | aucune annonce publiée | `no-listings` | Surveyed vacant lot with a blank board. |
| Données indisponibles | data missing | `no-data` | Chart that stops mid-line. |
| Aucun intérêt | no interest yet | `no-interest` | Empty inbox and a heart that has not landed. |

`<EmptyStateIllustration kind="no-results" className="mx-auto h-32 w-auto" />` above the sentence and
the retry/suggestion action. 240×180 viewBox.

---

## 4. Component API

Barrel import (all components, types and label maps):

```tsx
import {
  HeroHouseScene,
  FeatureIllustration,
  RegionScene,
  PropertyTypeThumb,
  PreMarketPhone,
  EmptyStateIllustration,
  REGIONS,
  getRegion,
} from "@/components/illustrations";
```

Shared props (`IllustrationProps`):

| Prop | Type | Default | Behaviour |
| --- | --- | --- | --- |
| `className` | `string` | — | Size the SVG here (`h-auto w-full`, `size-14`, …). |
| `width` / `height` | `number \| string` | component default | Real SVG attributes; `width="100%"` also works. |
| `title` | `string` | undefined | When set: `role="img"` + `<title>` (accessibility name). When omitted: `aria-hidden="true"` + `focusable="false"`. |
| other `<svg>` props | — | — | Forwarded (`id`, `data-*`, `aria-*`). |

Component-specific props: `FeatureIllustration kind`, `PropertyTypeThumb type`,
`EmptyStateIllustration kind`, `RegionScene code` (string, `"06"`/`"6"` accepted).

`PALETTE`, `IllustrationProps`, `illustrationA11y`, `regionSeed`, `regionVariant`,
`FEATURE_TITLES`, `PROPERTY_TYPE_LABELS`, `EMPTY_STATE_LABELS` are exported for reuse and tests.

### Integration recipes

```tsx
// Home hero — decorative, next to the real H1.
<div className="relative mx-auto w-full max-w-md">
  <HeroHouseScene className="h-auto w-full" />
</div>

// Intent / feature cards.
<FeatureIllustration kind="vendre" className="size-14" />

// Market region card.
<RegionScene code={region.code} className="aspect-[16/10] h-auto w-full rounded-xl" />

// Listing card media.
<PropertyTypeThumb type="plex" className="h-auto w-full" />

// Pre-market story.
<PreMarketPhone className="mx-auto h-auto w-full max-w-[16rem]" />

// Empty state above the message.
<EmptyStateIllustration kind="no-results" className="mx-auto h-32 w-auto" />
```

Nothing is wired into `src/app/**` yet except the automatic metadata files (OG, icons, manifest);
the Lead owns those page edits.

---

## 5. What we deliberately do differently from the reference

The reference product is not copied in any dimension — not its layout, its copy, its palette, its
photography, its renders or its 3D icons. We serve the same *jobs* with our own system.

| Dimension | What the reference-style slot usually does | What MaMaisonQC ships | Why |
| --- | --- | --- | --- |
| Hero image | Photo or AI render of a house (hundreds of KB, a specific undefined place) | Original flat SVG house on a generic Québec ridge, 4.2 KB | Licence-clean, crisp at any width, themeable, no fake location and no meaningless photography. |
| Service icons | 3D rendered icons on coloured tiles | 2D medallions, one concept each, two tints | Consistent with an editorial product, legible at 48 px, no rendering dependency. |
| Region imagery | Generic provincial photos, often one shared image across regions | 17 deterministic terrain scenes derived from official codes | Distinguishable, honest abstraction; no stock photo pretending to be a region. |
| Imagery copy | Text baked into the image | No text at all; copy from components | Français/English-ready, translatable, accessible and editable without a designer. |
| Property-type thumbnails | Interchangeable house icons | Type-specific architecture (plex exterior stair, surveyed lot, awning storefront) | The type must be identifiable at a glance, including the Québec-specific plex. |
| Pre-market phone | Screenshot with invented listings and prices | Wordless UI shapes; zero invented data | The site must never present fictional prices; the demo cannot be mistaken for real inventory. |
| Empty states | A single generic illustration | Four reason-specific drawings | Empty states are designed states, not accidents. |
| OG image | Screenshot or template with an external font | Code-generated 1200×630 card, bundled font, no fetch | Reliable share card at build time, no network dependency, no stale screenshot. |
| Icons | Renamed bitmap or third-party icon set | Two SVG masters → real PNGs (192/512/512-maskable/180) + vector favicon | Crisp maskable safe area, correct sizes, original mark. |
| Palette | Third-party brand colours | Product tokens + exactly 6 documented secondary hues | Own identity, AA text contrast, maintainable. |

---

## 6. Proofs and visual verification

All proofs live in `docs/` and were captured with Chrome headless at 2× device scale.

| File | Size (px) | What it proves |
| --- | --- | --- |
| `docs/assets-preview.html` | — | Self-contained board rendering **every** asset (all 34 illustrations + favicon + 4 PNG + OG), on paper, with labels, at realistic sizes. |
| `docs/proof.png` | 2800×6000 (1400×3000 CSS @2×) | Masthead, palette/contrast audit, hero at full width and at 320 px, six features, start of the region grid. |
| `docs/proof-regions.png` | 2800×6000 | The 17 region scenes, property thumbnails, phone mockup. |
| `docs/proof-rest.png` | 2800×5000 | Empty states, icon set (incl. circular mask), OG card, integration snippet. |
| `docs/proof-hero-375.png` | 750×526 (375 CSS @2×) | Hero at a real 375 px viewport — all details still legible, nothing clipped. |
| `docs/proof-hero-1440.png` | 2880×2016 (1440 CSS @2×) | Hero at desktop width — vector edges stay crisp, no rasterisation artefacts. |
| `docs/proof-icons.png` | 2400×1280 | Icon renders at native 192/512, circular maskable proof, 64 svg, 180 apple touch, on-paper and on-primary. |
| `docs/proof-og.png` | 1200×630 | The actual `next/og` output rendered in Node from the route module. |

Command used for the board (long page captured in 2× segments; the first uses the file directly):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1400,3000 --screenshot=docs/proof.png \
  "file://$PWD/docs/assets-preview.html"
```

Hero at fixed widths (Chrome clamps very small windows, so the 375 px case uses a fixed-width
wrapper and a crop of the 2× bitmap):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=600,400 --screenshot=/tmp/hero-375-full.png file:///tmp/hero-proof-375.html
magick /tmp/hero-375-full.png -crop 750x526+0+0 +repage docs/proof-hero-375.png
```

OG card rendered without a Next build (the route handler is a plain async function):

```tsx
import OpengraphImage from "./src/app/opengraph-image";
const image = await OpengraphImage();
await writeFile("docs/proof-og.png", Buffer.from(await image.arrayBuffer()));
```

**Iterations after inspection.** The hero was re-composed after the first screenshot (house scaled up,
path changed from a dashed ribbon to a single filled walkway, foreground warmed so the path reads,
far-shore specks removed). Region scenes were rebuilt after the first pass because four « fleuve »
and three « montagne » scenes were nearly identical; they now use a per-terrain variant motif.
The plex staircase, the renovation icon, the vacant-lot survey line and the maskable icon scale were
also corrected after visual review.

### PWA icon rendering

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# /tmp/icon.html and /tmp/icon-maskable.html wrap the master SVG at exactly 1024×1024, margin 0
"$CHROME" --headless --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,1024 --screenshot=/tmp/icon-1024.png file:///tmp/icon.html
"$CHROME" --headless --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,1024 --screenshot=/tmp/icon-maskable-1024.png file:///tmp/icon-maskable.html
sips -z 512 512 /tmp/icon-1024.png           --out public/icons/icon-512.png
sips -z 192 192 /tmp/icon-1024.png           --out public/icons/icon-192.png
sips -z 512 512 /tmp/icon-maskable-1024.png  --out public/icons/icon-512-maskable.png
sips -z 180 180 /tmp/icon-1024.png           --out src/app/apple-icon.png
```

---

## 7. File inventory

| Path | Bytes | What |
| --- | --- | --- |
| `src/components/illustrations/hero-house.tsx` | 6 370 | Hero scene, 800×560. Rendered SVG ≈ 4.2 KB. |
| `src/components/illustrations/features.tsx` | 6 374 | 6 feature medallions + `FEATURE_TITLES`. |
| `src/components/illustrations/region-scene.tsx` | 31 712 | 17-region catalogue + 7 terrain families with per-code motifs. |
| `src/components/illustrations/property-types.tsx` | 9 339 | 5 property thumbnails + labels. |
| `src/components/illustrations/phone-mockup.tsx` | 5 460 | Pre-market phone mockup. |
| `src/components/illustrations/empty-states.tsx` | 6 538 | 4 empty states + labels. |
| `src/components/illustrations/palette.ts` | 1 665 | Documented palette (tokens + 6 secondary hues + tints). |
| `src/components/illustrations/types.ts` | 1 210 | Shared props and a11y helper. |
| `src/components/illustrations/index.ts` | 1 441 | Barrel. |
| `src/app/opengraph-image.tsx` | 8 571 | 1200×630 OG card (next/og, bundled font). |
| `src/app/icon.svg` | 425 | Vector favicon (rounded 64×64). |
| `src/app/apple-icon.png` | 5 345 | 180×180 PNG. |
| `src/app/manifest.ts` | 1 442 | PWA manifest. |
| `public/icons/icon-192.png` | 5 756 | 192×192 PNG. |
| `public/icons/icon-512.png` | 17 541 | 512×512 PNG. |
| `public/icons/icon-512-maskable.png` | 17 092 | 512×512 PNG, maskable safe area. |
| `public/icons/icon-master.svg` | 745 | 1024×1024 source. |
| `public/icons/icon-maskable-master.svg` | 744 | 1024×1024 maskable source. |
| `docs/assets-preview.html` | ~91 KB | Self-contained proof board. |

The scaffold's unused `public/*.svg` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`,
`window.svg`) are **not** used by anything here; they predate this system and are left for the Lead
to delete with the rest of the scaffold cleanup.

---

## 8. Verification record

| Check | Command | Result |
| --- | --- | --- |
| TypeScript, repo-wide | `npx tsc --noEmit` | **exit 0**, no output. |
| ESLint, owned files | `npx eslint src/components/illustrations src/app/opengraph-image.tsx src/app/manifest.ts` | **exit 0**, no output. |
| No external refs / no text | `rg "href=\|src=\|@import\|base64\|<text\|<tspan" src/components/illustrations src/app/icon.svg public/icons/*.svg` | Only the required `xmlns`; no image/font URL, no text nodes. |
| Icon PNGs are real | `magick identify public/icons/*.png src/app/apple-icon.png` | 192×192, 512×512, 512×512, 180×180 — PNG, correct sizes. |
| Hero budget | rendered `renderToStaticMarkup(<HeroHouseScene />)` | 4.2 KB (< 60 KB). |
| Visual | Chrome headless 2× proofs above | Inspected, iterated at least once, final proofs kept. |
| Not run | `next build`, `next dev` | Out of scope: the Lead owns the app build; OG was proven at the module level instead. |

---

## 9. Maintenance rules

1. **Never paste a raster into an illustration.** Photos, AI renders and traced 3D icons stay out.
2. **Keep the SVG self-contained.** Colours are literal in `palette.ts`; no `var(--…)`, no external
   font, no `url()`.
3. **No text in artwork.** When a drawing must be announced, pass `title`; otherwise leave it
   decorative and let the page's heading carry the meaning.
4. **Changing the palette?** Edit `palette.ts`, then update the two icon masters (they contain the
   literal primary/paper/ochre values) and re-render the PNG set with the commands above.
5. **Adding a region or renaming one?** Update `REGIONS`; the code → terrain → motif mapping must
   stay deterministic. Keep the official 01–17 codes.
6. **Preview board.** `docs/assets-preview.html` is a build artefact generated from the real
   components with `react-dom/server` (`renderToStaticMarkup` per component, then a static shell
   with the paper background, labels and size notes). Re-generate it whenever a component changes;
   do not hand-edit the SVGs inside it.
7. **Re-run the gate before shipping**: `npx tsc --noEmit`, `npx eslint …`, re-render the proofs and
   look at them. A passing typecheck is not a visual proof.
