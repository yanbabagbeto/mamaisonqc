# Data — sources, ingestion, validation

The ETL lives in `pipeline/` and is **stdlib-only** (`urllib`, `xml.etree.ElementTree`,
`csv`, `zipfile`, `sqlite3`). It runs with the system `python3` (3.15 on this machine,
which has no lxml/pandas); `ElementTree.iterparse` provides the same streaming parse as
`lxml.iterparse`. It produces the files specified in [DATA-CONTRACT.md](DATA-CONTRACT.md).

```bash
python3 pipeline/run.py                                   # v1 scope, cap 60 000/municipality
python3 pipeline/run.py --municipalities 66023,65005 --max-units 2000
python3 pipeline/validate.py                              # independent re-validation
```

Artifacts are git-ignored (`/data/raw/`, `/data/normalized/*`, `/data/reports/`,
`/data/manifest.json`, `/data/*.db`); only `data/normalized/.gitkeep` is tracked.

---

## 1. Sources actually fetched

All URLs below returned HTTP 200 on 2026-10-26 and their payloads were checked (format,
headers, row shapes). Fetch times and SHA-256 are in `data/manifest.json`; the full URL
list, byte counts and durations are in `data/reports/ingest-report.json`.

| Dataset id | Dataset | Publisher | Licence | Exact URL used |
|---|---|---|---|---|
| `role-evaluation-2026` | Rôle d'évaluation foncière du Québec 2026 | MAMH / Affaires municipales | CC-BY 4.0 | index `https://donneesouvertes.affmunqc.net/role/indexRole2026.csv`; each file `https://donneesouvertes.affmunqc.net/role/RL<code>_2026.xml` (the exact per-file URL is the `lien` column of the index and is stored in `source_url`) |
| `registre-foncier-stats` | Statistiques du Registre foncier sur le marché immobilier | Registre foncier du Québec | Attribution (CC-BY 4.0) | package `https://www.donneesquebec.ca/recherche/api/3/action/package_show?id=statistiques-du-registre-foncier-du-quebec-sur-le-marche-immobilier`; 4 count CSVs + dictionary XLSX (URLs in §5) |
| `mamh-municipalites` | Répertoire des municipalités du Québec | MAMH | Attribution (CC-BY 4.0) | package `https://www.donneesquebec.ca/recherche/api/3/action/package_show?id=repertoire-des-municipalites-du-quebec`; resources `https://donneesouvertes.affmunqc.net/repertoire/MUN.csv` and `https://donneesouvertes.affmunqc.net/repertoire/MRC_CM_Arg.csv` |
| `cubf` | Liste des codes d'utilisation des biens-fonds (MEFQ, édition 2025) | MAMH | open government licence (as stated in the data contract) | page `https://www.mamh.gouv.qc.ca/evaluation-fonciere/manuel-devaluation-fonciere-du-quebec/codes-dutilisation-des-biens-fonds/` → `https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/affaires-municipales/publications/evaluation_fonciere/manuel_evaluation_fonciere/CUBF_MEFQ.xlsx` |
| `role-evaluation-2026-geopackage` | Rôle 2026 GeoPackage (unit points) | MAMH | CC-BY 4.0 | **no public download URL is recorded in the contract**; the file is extracted from the archive supplied with the project: `~/Downloads/ROLE2026_GEOPACKAGE.zip` → `Role2026_geopackage/Role_2026_2.gpkg` (2.806 GB, sha256 `0bff373c…fdf17b`) |

Notes and checks:

- The project owner also supplied `~/Downloads/Roles_Donnees_Ouvertes_2026.zip`. It is a
  **byte-identical mirror** of the portal files: sha256 of `RL75017_2026.xml` from the zip
  equals the portal download (`27e8d3243d2acd5c…`); the archive holds the same 1,134 XML
  files as the index, and all ten scope files have the same byte sizes as the portal
  downloads. The pipeline downloads from the official URLs and caches them in
  `data/raw/role/`.
- The owner-supplied `CUBF_MEFQ.xlsx` is **byte-identical** to the MAMH file
  (sha256 `98a7dd107f89ade82680b4af6ba3af9de4c3ad6a2ade3afb022331968d436835`).
- The MAMH CUBF page does not state an explicit licence; `licenseUrl` is left empty for
  that dataset rather than inventing one.
- `registre-foncier-stats` exposes two companion CSVs (`list_natr_transf_prop.csv`,
  `list_natr_diff_fin.csv`). They are lookup tables for the nature-of-act codes, a
  dimension the normalized artifact does not carry (see §5), so they are not ingested.
- The CKAN `/download/` endpoint returned intermittent 404s for the four count CSVs on
  2026-10-26. The fetcher retries, then falls back to the same resource through the
  official `datastore_search` API and records which path was used in the report.

---

## 2. Scope, cap and coverage

v1 scope is the ten municipalities of the contract (§4). The 2026 roll file is read for
each; the **roll year** (`RLM02A`) is the assessor's millésime and differs per city
(2024–2026) — it is *not* the year in the file name.

| Code | Municipalité | Unités source | Unités retenues | % | Année rôle (RLM02A) | Coordonnées | uni. | copro. | plex | terrain | non-rés. | autre |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 23027 | Québec | 175478 | 60000 | 34.2% | 2025 | 60000 | 45125 | 10016 | 4859 | 0 | 0 | 0 |
| 37067 | Trois-Rivières | 52147 | 52147 | 100.0% | 2025 | 52147 | 32683 | 3006 | 8440 | 4221 | 3425 | 372 |
| 43027 | Sherbrooke | 56325 | 56325 | 100.0% | 2025 | 56325 | 35724 | 3276 | 8775 | 4597 | 3620 | 333 |
| 58007 | Brossard | 33501 | 33501 | 100.0% | 2025 | 33501 | 18633 | 11772 | 1118 | 815 | 1083 | 80 |
| 58227 | Longueuil | 78904 | 60000 | 76.0% | 2025 | 60000 | 35086 | 13254 | 11660 | 0 | 0 | 0 |
| 64008 | Terrebonne | 44115 | 44115 | 100.0% | 2026 | 44115 | 30794 | 3877 | 3547 | 1402 | 4350 | 145 |
| 65005 | Laval | 154876 | 60000 | 38.7% | 2025 | 60000 | 48871 | 6480 | 4649 | 0 | 0 | 0 |
| 66023 | Montréal | 437192 | 60000 | 13.7% | 2026 | 60000 | 8620 | 37263 | 14117 | 0 | 0 | 0 |
| 75017 | Saint-Jérôme | 29857 | 29857 | 100.0% | 2026 | 29857 | 15257 | 3202 | 5452 | 2464 | 3325 | 157 |
| 81017 | Gatineau | 103287 | 60000 | 58.1% | 2024 | 60000 | 41651 | 10327 | 8022 | 0 | 0 | 0 |

**Total: 1 165 682 source units read → 515 945 kept (44.3 %).**

Cap rule applied exactly as written in §4: keep `unifamiliale|copropriete|plex` first,
then the rest, by ascending `mat18`; at most `--max-units` (default 60 000) per
municipality. `data/normalized/README.txt` repeats this warning with the per-city counts,
so the artifact can never be mistaken for full coverage.

Two consequences worth knowing (both are direct effects of that rule, not bugs):

1. In the five capped cities (Montréal, Laval, Québec, Longueuil, Gatineau) the
   residential stock alone exceeds the cap, so the emitted rows contain **only residential
   types** — no `terrain` and no `non-residentiel`. The per-city `propertyTypes` in
   `ingest-report.json` are the **emitted** counts; `propertyTypesSource` gives the full
   source distribution.
2. `mat18` encodes the MTM division/section grid, so "ascending mat18" is also a spatial
   ordering. The capped sample is therefore spatially biased. Measured on the emitted
   Montréal rows: 60 000 units spanning only **0.026° of longitude** (−73.5618 to
   −73.5357) and 0.224° of latitude (45.4467 to 45.6709) — a narrow strip through the
   centre of the island, while the city extends from about −73.98 to −73.47. The same
   mechanism applies to every capped city. A hash- or UMV-stratified sample would remove
   the bias but changes the contract's selection rule; it is the recommended follow-up if
   the valuation model needs city-wide coverage.

`--max-units 0` disables the cap (whole municipality; slow and memory-hungry).

---

## 3. Rôle d'évaluation — field extraction

### 3.1 `matricule` is `mat18` (`RL0104A…F`), not `RL0103Ax`

The contract originally mapped `RL0103Ax` to `matricule`. That is wrong, and the pipeline
does not follow it:

- The MAMH *Structure d'attributs — Rôle d'évaluation foncière 2026* (shipped inside the
  GeoPackage archive, PDF) documents `mat18` as the **18-character matricule**
  "division-section-emplacement-chiffre autovérificateur-bâtiment-local", and the open-role
  guide (p. 9) maps "Numéro matricule" to `RL0104A … RL0104H`. `RL0103Ax` does not appear
  in the 2026 attribute structure at all.
- In the data, `RL0103Ax` behaves like a cadastral lot: **1 012 / 437 192** Montréal units
  have none, it can repeat inside one unit (up to 28 lots in one case), and in an
  11 193-unit test municipality the first value collided across 66 units.
- The exact composition, verified against the GeoPackage `mat18` field on units matched by
  their dossier number, is
  `RL0104A(4) + RL0104B(2) + RL0104C(4) + RL0104D(1) + RL0104E(3) + RL0104F(4)`,
  zero-padded to 18 characters (e.g. `A=0040,B=42,C=9082,D=7,E=001,F=0002` → `004042908270010002`).
  This is unique **1 165 682 / 1 165 682** across the ten cities (0 duplicates), and equals
  `id_provinc` minus the 5-digit municipality code.
- `id = <municipality_code>-<mat18>`, matching `id_provinc`.

`RL0104G`/`RL0104H` (fuseau, discriminant) are separate 2026 attributes and are *not* part
of `mat18`; they are not stored.

### 3.2 Address

One `RL0101` block per unit in all ten files. The first non-empty value of
`RL0101Ax`/`RL0101Gx`/`RL0101Ix` is used for `addr_no`, `addr_street`, `addr_suite`.
Per the contract, the upper civic number, fraction/letter, generic road code, link code and
cardinal point (`RL0101Bx…Hx`, `Jx`) are not stored, so `addr_no` is the *lower* number only.

`addr_street_norm` reproduces `src/shared/slug.ts` (`normalizeStreet`): accent-stripped,
lowercase, every non-alphanumeric run → one space, trimmed, collapsed.

### 3.3 Numbers

- Money is converted to integer cents with `Decimal` (`$332.00` → `33200`; `$33 200.50` →
  `3320050`). A source `0` is a real assessed value and is kept as `0`.
- Measures (`land_area_m2`, `frontage_m`, `floors`) and `year_built`: a source `0` is treated
  as "not applicable" and written as an empty string; `year_built` outside `1600–2100` is
  also empty (the 2026 attribute domain is 1600–2050).
- Decimals are emitted without trailing zeros (`3037.70` → `3037.7`); no rounding beyond
  what the source carries.
- Missing values are always the empty string — never `0`, `null` or `N/A`.

`roll_year` is written per row from the file's `RLM02A`, and check 4 proves it is constant
within each municipality.

---

## 4. CUBF → `property_type`

Source: the official MAMH list (`LISTE NUMÉRIQUE` sheet, 1 703 codes, edition 2025). The
`cubf_label` is the official description for the exact 4-digit code (empty for 14 retired
codes found in the data — 20 units — which still get a type from their CUBF group).

### 4.1 Rules, in precedence order

1. CUBF groups `2xxx–8xxx` (industry, transport, commercial, services, culture, natural
   resources) → **`non-residentiel`**.
2. CUBF land codes `1701, 1702, 9100, 9211, 9212, 9219, 9220, 9900` → **`terrain`**.
3. Residential auxiliaries that are not dwellings (`1921` stationnement intérieur,
   `1922` stationnement extérieur, `1923` espace de rangement) → **`non-residentiel`**.
4. Group `1xxx` with `RL0104F` (numéro de local) present → **`copropriete`**. The official
   guide defines `RL0104F` as present only for a *partie privative d'un immeuble en
   copropriété divise* (or an art. 208 occupant), so this is a real field, not a guess.
5. Group `1xxx`, single-dwelling CUBF (`1000, 1010, 1100, 1211, 1212`) with
   `RL0311A ≥ 2` (nombre total de logements) → **`plex`**.
6. Same codes with `RL0311A ≤ 1` or absent → **`unifamiliale`**.
7. Group `9xxx`: vacant non-residential floor space (`9420–9490`), non-residential building
   under construction (`9520`) → **`non-residentiel`**; water (`93xx`), vacant dwelling
   (`9410`), residential construction (`9510`), burnt building (`9530`), temporary codes
   (`98xx`) and anything else → **`autre`**.
8. Anything unmapped → **`autre`** (never guessed).

Commercial divided co-ownership (`4631`, `4632`) stays `non-residentiel` even when a local
number is present, because the CUBF itself says *non résidentielle*.

Distribution over the 1 165 682 source units, and over the emitted rows:

| type | source units | emitted units |
|---|---|---|
| unifamiliale | 537 121 | 312 444 |
| copropriete | 275 434 | 102 473 |
| plex | 222 580 | 70 639 |
| terrain | 47 664 | 13 499 |
| non-residentiel | 79 098 | 15 803 |
| autre | 3 785 | 1 087 |
| **total** | **1 165 682** | **515 945** |

(These sum to the source total and to the emitted total; the per-city breakdown is in §2
and in `ingest-report.json`.)

### 4.2 Full table of the CUBF codes encountered (1 014)

`cubf_default_type` is the type obtained from the CUBF code alone, before rules 4–6 refine
`unifamiliale` into `copropriete`/`plex` using `RL0104F` and `RL0311A`.
`units_in_scope` counts all source units of the ten cities.

<details>
<summary>1 014 CUBF codes (click to expand)</summary>

| CUBF | Libellé officiel (MAMH) | property_type (CUBF seul) | Unités (10 villes) |
|---|---|---|---|
| 1000 | Logement | unifamiliale | 1027809 |
| 1010 | Logements sociaux et abordables | unifamiliale | 1747 |
| 1100 | Chalet ou maison de villégiature | unifamiliale | 620 |
| 1211 | Maison mobile | unifamiliale | 4820 |
| 1212 | Roulotte résidentielle | unifamiliale | 18 |
| 1511 | Maison de chambres et pension | autre | 745 |
| 1512 | Maison de chambres pour personnes ayant une déficience intellectuelle | autre | 90 |
| 1513 |  | autre | 1 |
| 1521 | Local pour les associations fraternelles | autre | 10 |
| 1522 | Maison des jeunes | autre | 35 |
| 1529 | Autres maisons et locaux fraternels | autre | 8 |
| 1532 | Maison d’étudiants (collège et université) | autre | 45 |
| 1539 | Autres résidences d’étudiants | autre | 33 |
| 1541 | Maison pour personnes retraitées non autonomes (inclut les CHSLD) | autre | 186 |
| 1543 | Maison pour personnes retraitées autonomes | autre | 415 |
| 1549 | Autres maisons pour personnes retraitées | autre | 36 |
| 1551 | Couvent | autre | 100 |
| 1552 | Monastère | autre | 16 |
| 1553 | Presbytère | autre | 249 |
| 1559 | Autres maisons d’institutions religieuses | autre | 86 |
| 1590 | Autres locaux de groupes | autre | 32 |
| 1600 | Hôtel résidentiel | autre | 3 |
| 1610 | Motel résidentiel | autre | 1 |
| 1701 | Parc de roulottes (fonds de terre seulement) | terrain | 1 |
| 1702 | Parc de maisons mobiles (fonds de terre seulement) | terrain | 27 |
| 1890 | Autres résidences provisoires | autre | 16 |
| 1912 | Pourvoirie sans droits exclusifs | autre | 2 |
| 1913 | Camp de chasse et pêche | autre | 4 |
| 1914 | Camp forestier | autre | 55 |
| 1921 | Stationnement intérieur | non-residentiel | 8290 |
| 1922 | Stationnement extérieur | non-residentiel | 2736 |
| 1923 | Espace de rangement | non-residentiel | 1162 |
| 1990 | Autres immeubles résidentiels | autre | 1004 |
| 2011 | Industrie de l’abattage et du conditionnement de la viande (sauf la volaille et le petit gibier) | non-residentiel | 10 |
| 2012 | Industrie de l’abattage et de la transformation de la volaille et du petit gibier | non-residentiel | 6 |
| 2014 | Industrie de la transformation de la viande et de la fonte des graisses animales | non-residentiel | 7 |
| 2020 | Industrie de la préparation et du conditionnement de poissons et de fruits de mer | non-residentiel | 3 |
| 2031 | Conserverie, marinage, saumurage et séchage de fruits et de légumes | non-residentiel | 2 |
| 2032 | Industrie de fruits et de légumes congelés | non-residentiel | 1 |
| 2039 | Autres industries de produits alimentaires à base de fruits et de légumes | non-residentiel | 4 |
| 2043 | Industrie du lait de consommation | non-residentiel | 3 |
| 2044 | Industrie de produits laitiers secs et concentrés | non-residentiel | 1 |
| 2045 | Industrie du fromage | non-residentiel | 5 |
| 2046 | Fabrication de crème glacée et de desserts congelés | non-residentiel | 2 |
| 2049 | Autres industries de produits laitiers et succédannés | non-residentiel | 3 |
| 2051 | Meunerie et minoterie | non-residentiel | 3 |
| 2061 | Industrie d’aliments pour chats et chiens | non-residentiel | 1 |
| 2062 | Industrie d’aliments pour autres animaux | non-residentiel | 3 |
| 2071 | Industrie de biscuits, de craquelins et de biscottes | non-residentiel | 2 |
| 2072 | Industrie du pain | non-residentiel | 23 |
| 2073 | Industrie de produits de boulangerie commerciale, de produits de boulangerie congelés et pâtisseries | non-residentiel | 3 |
| 2074 | Industrie de pâtes alimentaires sèches | non-residentiel | 2 |
| 2075 | Industrie de mélanges de farine et de pâte | non-residentiel | 1 |
| 2076 | Industrie de tortillas | non-residentiel | 1 |
| 2077 | Industrie de produits de boulangerie, du pain et de pâtisseries avec vente au détail sur place de moins 50 % de la marchandise produite | non-residentiel | 2 |
| 2079 | Industrie d'autres produits de boulangerie et de pâtisseries | non-residentiel | 4 |
| 2081 | Industrie de chocolat et de confiseries chocolatées | non-residentiel | 10 |
| 2082 | Industrie du sucre de canne et de betteraves à sucre | non-residentiel | 2 |
| 2083 | Amidonnerie et fabrication de graisses et d'huiles végétales | non-residentiel | 1 |
| 2084 | Industrie d'assaisonnements et de vinaigrettes | non-residentiel | 4 |
| 2087 | Industrie du thé et du café | non-residentiel | 7 |
| 2088 | Industrie d'aliments à grignoter | non-residentiel | 1 |
| 2089 | Industries d'autres produits alimentaires | non-residentiel | 109 |
| 2091 | Industrie de boissons gazeuses | non-residentiel | 3 |
| 2092 | Industrie d’alcools destinés à la consommation (distillerie) | non-residentiel | 8 |
| 2093 | Industrie de la bière | non-residentiel | 8 |
| 2095 | Industrie de l’eau naturelle et gazéifiée | non-residentiel | 5 |
| 2096 | Industrie de la glace | non-residentiel | 1 |
| 2097 | Industrie de sirops et de concentrés aromatisants | non-residentiel | 1 |
| 2099 | Autres industries de boissons | non-residentiel | 2 |
| 2120 | Industrie des produits du tabac | non-residentiel | 2 |
| 2130 | Industrie du cannabis | non-residentiel | 3 |
| 2213 | Industrie de pneus et de chambres à air | non-residentiel | 2 |
| 2215 | Industrie de tuyaux souples et de courroies en caoutchouc et en plastique | non-residentiel | 1 |
| 2217 | Recyclage de produits de tout matériau pour transformation primaire | non-residentiel | 3 |
| 2219 | Industrie d'autres produits en caoutchouc | non-residentiel | 15 |
| 2221 | Industrie de produits en mousse de polystyrène | non-residentiel | 4 |
| 2235 | Industrie de pellicules et de feuilles non renforcées en plastique | non-residentiel | 5 |
| 2240 | Industrie de produits en plastique stratifié, sous pression ou renforcé | non-residentiel | 8 |
| 2250 | Industrie de produits d’architecture en plastique | non-residentiel | 2 |
| 2261 | Industrie de contenants en plastique | non-residentiel | 8 |
| 2262 | Industrie du recyclage des bouteilles en plastique | non-residentiel | 1 |
| 2270 | Industrie de portes et de fenêtres en plastique | non-residentiel | 4 |
| 2291 | Industrie de sacs et de sachets en plastique | non-residentiel | 13 |
| 2292 | Industrie d'appareils sanitaires en plastique | non-residentiel | 1 |
| 2293 | Industrie de pièces en plastique pour véhicules automobiles | non-residentiel | 1 |
| 2299 | Industrie de tous les autres produits en plastique | non-residentiel | 40 |
| 2320 | Industrie de la chaussure | non-residentiel | 7 |
| 2342 | Industrie d’accessoires pour bottes et chaussures | non-residentiel | 1 |
| 2390 | Autres industries du cuir et de produits connexes | non-residentiel | 1 |
| 2410 | Industrie de filés et de tissus tissés (coton) | non-residentiel | 4 |
| 2432 | Industrie du tissage de fibres synthétiques | non-residentiel | 1 |
| 2471 | Industrie de sacs et de poches en matière textile | non-residentiel | 2 |
| 2472 | Industrie d’articles en grosse toile ou de substituts de la toile (bâche et tentes) | non-residentiel | 13 |
| 2491 | Industrie du fil | non-residentiel | 1 |
| 2493 | Industrie de broderie, de plissage et d’ourlets | non-residentiel | 3 |
| 2494 | Industrie de la teinture, du finissage de textiles et de tissus et revêtement de tissus | non-residentiel | 4 |
| 2495 | Industrie d’articles de maison en textile et d'articles d'hygiène en textile | non-residentiel | 1 |
| 2499 | Autres industries de produits textiles | non-residentiel | 11 |
| 2510 | Incubateur industriel | non-residentiel | 1 |
| 2612 | Industrie de la confection à forfait de vêtements pour hommes et garçons | non-residentiel | 1 |
| 2614 | Industrie de complets, d'uniformes et de vestons pour hommes et garçons | non-residentiel | 1 |
| 2619 | Industries d'autres vêtements coupés-cousus pour hommes et garçons | non-residentiel | 2 |
| 2627 | Industrie de lingerie, de vêtements de détente et de vêtements de nuit pour femmes et filles | non-residentiel | 1 |
| 2629 | Industries d'autres vêtements coupés-cousus pour femmes et filles | non-residentiel | 2 |
| 2631 | Industrie de la confection de vêtements pour enfants et bébés | non-residentiel | 1 |
| 2652 | Industrie de bas et de chaussettes | non-residentiel | 1 |
| 2694 | Industrie de vêtements professionnels coupés-cousus | non-residentiel | 3 |
| 2699 | Industries d'accessoires vestimentaires et d'autres vêtements | non-residentiel | 139 |
| 2713 | Industrie de produits de scierie et d’ateliers de rabotage | non-residentiel | 3 |
| 2721 | Industrie de placages en bois | non-residentiel | 3 |
| 2722 | Industrie de contreplaqués en bois | non-residentiel | 1 |
| 2723 | Fabrication de produits de charpente en bois (autres qu'en bois massif) | non-residentiel | 5 |
| 2731 | Industrie de portes et de fenêtres en bois (incluant cadres) | non-residentiel | 14 |
| 2732 | Industrie de parquets en bois dur | non-residentiel | 1 |
| 2733 | Industrie de la préfabrication de maisons mobiles et autres bâtiments mobiles | non-residentiel | 4 |
| 2734 | Industrie de la préfabrication de maisons | non-residentiel | 3 |
| 2735 | Industrie de bâtiments préfabriqués à charpente de bois | non-residentiel | 4 |
| 2736 | Industrie d’armoires, de placards de cuisine et de coiffeuses de salle de bains en bois | non-residentiel | 58 |
| 2737 | Fabrication d'escaliers en bois | non-residentiel | 6 |
| 2738 | Fabrication de boiseries décoratives et de moulures en bois | non-residentiel | 3 |
| 2739 | Industrie de tous les autres produits divers en bois | non-residentiel | 17 |
| 2740 | Industrie de contenants en bois et de palettes en bois | non-residentiel | 5 |
| 2750 | Industrie du cercueil en bois ou en métal | non-residentiel | 1 |
| 2791 | Industrie de la préservation du bois | non-residentiel | 2 |
| 2792 | Industrie du bois tourné et façonné | non-residentiel | 3 |
| 2793 | Industrie de panneaux de particules et de fibres | non-residentiel | 1 |
| 2799 | Autres industries du bois | non-residentiel | 26 |
| 2811 | Industrie du meuble rembourré résidentiel | non-residentiel | 5 |
| 2812 | Industrie du meuble de maison en bois | non-residentiel | 12 |
| 2819 | Autres industries du meuble résidentiel | non-residentiel | 31 |
| 2821 | Industrie du meuble de bureau, en métal | non-residentiel | 2 |
| 2822 | Industrie du meuble de bureau, en bois | non-residentiel | 6 |
| 2829 | Autres industries du meuble de bureau | non-residentiel | 10 |
| 2891 | Industrie de sommiers et de matelas | non-residentiel | 5 |
| 2892 | Industrie du meuble et d’articles d’ameublement pour hôtels, restaurants et institutions | non-residentiel | 9 |
| 2893 | Industrie du meuble de jardin | non-residentiel | 1 |
| 2895 | Industrie du cadre | non-residentiel | 5 |
| 2899 | Autres industries du meuble et d’articles d’ameublement | non-residentiel | 20 |
| 2911 | Industrie de pâte mécanique, thermomécanique et mi-chimique | non-residentiel | 13 |
| 2913 | Industrie du papier journal et papier d'impression de pâte mécanique | non-residentiel | 1 |
| 2914 | Industrie de fabrication du carton ou de transformation du carton | non-residentiel | 3 |
| 2919 | Autres industries du papier | non-residentiel | 8 |
| 2931 | Industrie de boîtes pliantes et rigides | non-residentiel | 4 |
| 2932 | Industrie de boîtes en carton ondulé et en carton compact | non-residentiel | 4 |
| 2933 | Industrie de sacs en papier | non-residentiel | 2 |
| 2939 | Industrie d'autres contenants en carton | non-residentiel | 1 |
| 2991 | Industrie du papier couché, traité et contrecollé | non-residentiel | 2 |
| 2992 | Industrie de produits de papeterie | non-residentiel | 1 |
| 2993 | Industrie de produits en papier hygiénique jetable | non-residentiel | 1 |
| 2994 | Industrie du papier recyclé | non-residentiel | 1 |
| 2999 | Industrie de tous les autres produits en papier transformé | non-residentiel | 7 |
| 3011 | Industrie de l’impression de formulaires commerciaux | non-residentiel | 28 |
| 3012 | Industrie de l’impression de journaux, de publications et de catalogues | non-residentiel | 4 |
| 3013 | Industrie de l’impression de périodiques ou de revues | non-residentiel | 1 |
| 3014 | Industrie de l’impression de livres | non-residentiel | 1 |
| 3017 | Industrie de l'impression numérique | non-residentiel | 3 |
| 3019 | Autres activités d’impression commerciale | non-residentiel | 463 |
| 3020 | Industrie du clichage, de la composition, de la reliure et de la lithographie | non-residentiel | 6 |
| 3031 | Industrie de l’édition du livre | non-residentiel | 2 |
| 3033 | Industrie de l'édition de périodiques ou de revues | non-residentiel | 1 |
| 3039 | Autres industries de l’édition | non-residentiel | 1 |
| 3041 | Industrie de journaux (impression et édition combinées) | non-residentiel | 2 |
| 3049 | Autres industries de l’impression et de l’édition (combinées) | non-residentiel | 3 |
| 3050 | Éditeur de logiciels ou progiciels | non-residentiel | 1 |
| 3111 | Industrie de ferro-alliages | non-residentiel | 5 |
| 3113 | Industrie de formes en acier laminé à froid, à partir d'acier acheté | non-residentiel | 2 |
| 3114 | Industrie d'étirage de fils d'acier | non-residentiel | 2 |
| 3119 | Autres industries sidérurgiques | non-residentiel | 3 |
| 3120 |  | non-residentiel | 1 |
| 3121 | Industrie de tubes et de tuyaux en fer et en acier à partir d'acier acheté | non-residentiel | 4 |
| 3140 | Fonderie de fer | non-residentiel | 1 |
| 3152 | Laminage, étirage, extrusion et alliage de métaux non ferreux (sauf le cuivre et l'aluminium) | non-residentiel | 8 |
| 3159 |  | non-residentiel | 1 |
| 3162 | Industrie de l'étirage, de l’extrusion et alliage de l’aluminium, fabriqué à partir d'aluminium acheté | non-residentiel | 6 |
| 3182 | Fonderie de métaux non ferreux, sauf moulage sous pression | non-residentiel | 1 |
| 3190 |  | non-residentiel | 1 |
| 3210 | Industrie de chaudières, d'échangeurs de chaleur et de plaques métalliques | non-residentiel | 5 |
| 3221 | Industrie de bâtiments préfabriqués en métal (sauf transportables) | non-residentiel | 4 |
| 3222 | Industrie de barres d'armature | non-residentiel | 2 |
| 3229 | Autres industries de la fabrication d’éléments de charpentes métalliques | non-residentiel | 43 |
| 3231 | Industrie de portes et de fenêtres en métal | non-residentiel | 42 |
| 3232 | Industrie de bâtiments préfabriqués en métal, transportables | non-residentiel | 2 |
| 3239 | Autres industries de produits métalliques d’ornement et d’architecture | non-residentiel | 38 |
| 3241 | Industrie du revêtement métallique, sur commande | non-residentiel | 9 |
| 3243 | Industrie de la tôlerie pour ventilation | non-residentiel | 13 |
| 3244 | Industrie de récipients et de boîtes en métal | non-residentiel | 2 |
| 3245 | Industrie de réservoirs en métal (épais) | non-residentiel | 1 |
| 3249 | Autres industries de l’emboutissage, du matriçage et du revêtement métallique | non-residentiel | 14 |
| 3253 | Industrie d’attaches d’usage industriel | non-residentiel | 2 |
| 3259 | Autres industries de produits en fil métallique | non-residentiel | 4 |
| 3261 | Industrie de la quincaillerie de base | non-residentiel | 2 |
| 3262 | Industrie de matrices, de moules et d’outils tranchants et à profiler, en métal | non-residentiel | 8 |
| 3263 | Industrie de l’outillage à main | non-residentiel | 1 |
| 3264 | Industrie de produits tournés, de vis, d'écrous et de boulons | non-residentiel | 1 |
| 3269 | Autres industries de la coutellerie ou d’autres articles de quincaillerie ou d’outillage | non-residentiel | 2 |
| 3270 | Industrie du matériel de chauffage et du matériel de réfrigération commerciale | non-residentiel | 17 |
| 3280 | Atelier d’usinage | non-residentiel | 238 |
| 3291 | Industrie de garnitures et de raccords de plomberie en métal | non-residentiel | 1 |
| 3292 | Industrie de soupapes en métal | non-residentiel | 1 |
| 3295 | Industrie de l'estampage | non-residentiel | 3 |
| 3299 | Autres industries de produits métalliques divers | non-residentiel | 61 |
| 3310 | Industrie de machines agricoles | non-residentiel | 2 |
| 3330 |  | non-residentiel | 2 |
| 3331 | Industrie de ventilateurs, de soufflantes et de purificateurs d'air industriels et commerciaux | non-residentiel | 4 |
| 3340 | Industrie de la machinerie pour l'industrie du caoutchouc et du plastique | non-residentiel | 3 |
| 3350 | Industrie de la machinerie pour le commerce et les industries de services | non-residentiel | 4 |
| 3391 | Industrie de compresseurs et de pompes | non-residentiel | 4 |
| 3392 | Industrie de l’équipement de manutention | non-residentiel | 14 |
| 3393 | Industrie de la machinerie pour les scieries et le travail du bois | non-residentiel | 1 |
| 3395 | Industrie de la machinerie pour l’industrie de pâtes et de papiers | non-residentiel | 1 |
| 3396 | Industrie de la machinerie pour la construction et du matériel d’entretien | non-residentiel | 5 |
| 3399 | Autres industries de la machinerie industrielle et de l’équipement industriel | non-residentiel | 48 |
| 3410 |  | non-residentiel | 2 |
| 3411 | Industrie des appareils d’aéronefs (incluant avions et hélicoptères) | non-residentiel | 4 |
| 3412 | Industrie des pièces et accessoires d'aéronefs (incluant avions et hélicoptères) | non-residentiel | 13 |
| 3430 | Industrie de véhicules automobiles | non-residentiel | 2 |
| 3441 | Industrie de carrosseries de camions et d’autobus | non-residentiel | 11 |
| 3442 | Industrie de remorques d’usage non commercial | non-residentiel | 4 |
| 3443 | Industrie de semi-remorques et de remorques d’usage commercial | non-residentiel | 4 |
| 3444 | Industrie des roulottes de tourisme et campeuses | non-residentiel | 2 |
| 3451 | Industrie de moteurs et de pièces de moteurs de véhicules automobiles | non-residentiel | 2 |
| 3453 | Industrie de roues et de freins pour véhicules automobiles | non-residentiel | 1 |
| 3454 | Industrie de pièces et d’accessoires en plastique pour véhicules automobiles | non-residentiel | 3 |
| 3455 | Industrie d’accessoires en matière textile pour véhicules automobiles | non-residentiel | 1 |
| 3456 | Industrie de carrosseries de véhicules automobiles | non-residentiel | 3 |
| 3459 | Autres industries de pièces et d’accessoires pour véhicules automobiles | non-residentiel | 15 |
| 3460 | Industrie du matériel ferroviaire roulant | non-residentiel | 1 |
| 3480 | Industrie de la construction et de la réparation d’embarcations | non-residentiel | 3 |
| 3490 | Autres industries du matériel de transport | non-residentiel | 4 |
| 3510 | Industrie de petits appareils électroménagers | non-residentiel | 5 |
| 3520 | Industrie de gros appareils | non-residentiel | 1 |
| 3531 | Industrie d’appareils d’éclairage (sauf ampoules et tubes) | non-residentiel | 6 |
| 3532 | Industrie de lampes électriques (ampoules et tubes) | non-residentiel | 1 |
| 3539 | Autres industries d’appareils d’éclairage | non-residentiel | 2 |
| 3542 | Industrie du matériel électronique audio et vidéo | non-residentiel | 2 |
| 3551 | Industrie d’équipements de télécommunication | non-residentiel | 6 |
| 3552 | Industrie de pièces et de composantes électroniques | non-residentiel | 13 |
| 3559 | Autres industries du matériel électronique et de communication | non-residentiel | 11 |
| 3561 | Industrie de transformateurs électriques | non-residentiel | 1 |
| 3562 | Industrie du matériel électrique de communication et de protection | non-residentiel | 6 |
| 3569 | Autres industries du matériel électrique d’usage industriel | non-residentiel | 5 |
| 3571 | Industrie d’ordinateurs et de leurs unités périphériques | non-residentiel | 2 |
| 3579 | Autres industries de machines pour bureaux, magasins, commerces et usage personnel | non-residentiel | 3 |
| 3580 | Industrie de fils et de câbles électriques | non-residentiel | 5 |
| 3591 | Industrie d’accumulateurs | non-residentiel | 1 |
| 3595 | Centrale de biomasse ou de cogénération | non-residentiel | 1 |
| 3599 | Autres industries de produits électriques | non-residentiel | 12 |
| 3611 | Industrie de matériaux de construction en argile et de produits réfractaires | non-residentiel | 1 |
| 3612 | Industrie de la poterie, d'articles en céramique et d'appareils sanitaires | non-residentiel | 2 |
| 3620 | Industrie du ciment | non-residentiel | 6 |
| 3630 | Industrie de produits en pierre | non-residentiel | 21 |
| 3641 | Industrie de tuyaux, de briques et de blocs en béton | non-residentiel | 5 |
| 3642 | Industrie de produits de construction en béton | non-residentiel | 6 |
| 3649 | Autres industries de produits en béton | non-residentiel | 15 |
| 3650 | Industrie du béton préparé | non-residentiel | 23 |
| 3661 | Industrie du verre | non-residentiel | 5 |
| 3662 | Industrie de produits en verre fabriqué à partir de verre acheté | non-residentiel | 20 |
| 3670 | Industrie de produits abrasifs | non-residentiel | 2 |
| 3680 | Industrie de la chaux | non-residentiel | 1 |
| 3699 | Industrie de tous les autres produits minéraux non métalliques | non-residentiel | 7 |
| 3711 | Industrie de produits pétroliers raffinés (sauf les huiles de graissage et les graisses lubrifiantes) | non-residentiel | 1 |
| 3712 | Industrie d’huiles de graissage et de graisses lubrifiantes | non-residentiel | 3 |
| 3713 | Ligne de l’oléoduc | non-residentiel | 7 |
| 3714 | Raffinerie de pétrole | non-residentiel | 1 |
| 3719 | Autres services du pétrole | non-residentiel | 4 |
| 3790 |  | non-residentiel | 2 |
| 3791 | Industrie de la fabrication de mélanges d'asphaltage et de pavés d'asphalte | non-residentiel | 7 |
| 3799 | Industrie d'autres produits du pétrole et du charbon | non-residentiel | 3 |
| 3831 | Industrie de résines synthétiques et de caoutchouc synthétique | non-residentiel | 5 |
| 3832 | Industrie de fibres et de filaments artificiels et synthétiques | non-residentiel | 2 |
| 3840 | Industrie de produits pharmaceutiques et de médicaments | non-residentiel | 28 |
| 3850 | Industrie de peinture, de teinture et de vernis | non-residentiel | 11 |
| 3860 |  | non-residentiel | 1 |
| 3861 | Industrie de savons et de détachants pour le nettoyage | non-residentiel | 13 |
| 3870 | Industrie de produits de toilette | non-residentiel | 4 |
| 3881 | Industrie de pigments et de colorants secs | non-residentiel | 1 |
| 3882 | Industrie de produits chimiques inorganiques d’usage industriel | non-residentiel | 6 |
| 3883 | Industrie de produits chimiques organiques d’usage industriel | non-residentiel | 2 |
| 3891 | Industrie d’encres d’imprimerie | non-residentiel | 6 |
| 3892 | Industrie d’adhésifs, de colles et de produits connexes | non-residentiel | 3 |
| 3893 | Industrie d’explosifs, de détonateurs pour explosifs et de dispositifs explosifs (sauf les munitions) | non-residentiel | 1 |
| 3894 | Industrie de produits pétrochimiques | non-residentiel | 1 |
| 3895 | Industrie de fabrication de gaz industriels | non-residentiel | 4 |
| 3897 | Industrie du recyclage des cartouches de jet d'encre | non-residentiel | 1 |
| 3899 | Industrie de tous les autres produits chimiques | non-residentiel | 18 |
| 3911 | Industrie d’instruments d’indication, d’enregistrement et de commande | non-residentiel | 5 |
| 3913 | Industrie d’appareils orthopédiques et chirurgicaux | non-residentiel | 4 |
| 3914 | Industrie d’articles ophtalmiques | non-residentiel | 4 |
| 3915 | Atelier de mécanicien-dentiste | non-residentiel | 8 |
| 3919 | Autres industries du matériel scientifique et professionnel | non-residentiel | 16 |
| 3921 | Industrie de la bijouterie et de l’orfèvrerie (sauf l’affinage secondaire de métaux précieux) | non-residentiel | 3 |
| 3931 | Industrie d’articles de sport et d'athlétisme | non-residentiel | 9 |
| 3932 | Industrie de jouets et de jeux | non-residentiel | 3 |
| 3933 | Industrie de la bicyclette | non-residentiel | 3 |
| 3934 | Industrie du trophée | non-residentiel | 1 |
| 3940 | Industrie de stores vénitiens | non-residentiel | 2 |
| 3971 | Industrie d’enseignes au néon (excluant les enseignes en bois) | non-residentiel | 15 |
| 3972 | Industrie d'enseignes en bois (excluant les enseignes au néon) | non-residentiel | 2 |
| 3973 | Industrie de tableaux d’affichage et de panneaux-réclames | non-residentiel | 1 |
| 3979 | Autres industries d'enseignes, d'étalages et de tableaux d'affichage | non-residentiel | 6 |
| 3991 | Industrie de balais, de brosses et de vadrouilles | non-residentiel | 1 |
| 3992 | Industrie de boutons, de boucles et d’attaches pour vêtements | non-residentiel | 1 |
| 3994 | Industrie de la fabrication de supports d’enregistrement, de la reproduction du son et des instruments de musique | non-residentiel | 1 |
| 3999 | Autres industries de produits manufacturés | non-residentiel | 629 |
| 4111 | Chemin de fer (sauf train touristique, aiguillage et cour de triage) | non-residentiel | 253 |
| 4112 | Aiguillage et cour de triage de chemins de fer | non-residentiel | 31 |
| 4113 | Gare de chemins de fer | non-residentiel | 18 |
| 4116 | Entretien et équipement de chemins de fer | non-residentiel | 6 |
| 4119 | Autres activités reliées au transport par chemin de fer | non-residentiel | 19 |
| 4122 | Station de métro | non-residentiel | 4 |
| 4123 | Entretien pour le métro | non-residentiel | 10 |
| 4211 | Gare d’autobus pour passagers | non-residentiel | 24 |
| 4214 | Garage d’autobus et équipement d’entretien | non-residentiel | 44 |
| 4215 | Abribus | non-residentiel | 33 |
| 4219 | Autres activités reliées au transport par autobus | non-residentiel | 18 |
| 4221 | Entrepôt pour le transport par camion | non-residentiel | 111 |
| 4222 | Garage et équipement d’entretien pour le transport par camion (incluant les garages municipaux) | non-residentiel | 174 |
| 4229 | Autres activités reliées au transport de matériaux par camion | non-residentiel | 44 |
| 4291 | Transport par taxi | non-residentiel | 15 |
| 4292 | Service d’ambulance | non-residentiel | 7 |
| 4293 | Service de limousine | non-residentiel | 2 |
| 4299 | Autres transports par véhicule automobile | non-residentiel | 769 |
| 4311 | Aéroport et aérodrome | non-residentiel | 12 |
| 4312 | Aérogare | non-residentiel | 1 |
| 4313 | Entrepôt de l’aéroport | non-residentiel | 1 |
| 4314 | Aérogare pour passagers et marchandises | non-residentiel | 1 |
| 4315 | Hangar à avion | non-residentiel | 54 |
| 4316 | Réparation et entretien des avions | non-residentiel | 5 |
| 4319 | Autres aéroports | non-residentiel | 4 |
| 4391 | Héliport | non-residentiel | 5 |
| 4399 | Autres transports par avion (infrastructure) | non-residentiel | 5 |
| 4411 | Terminus maritime (passagers) incluant les gares de traversiers | non-residentiel | 5 |
| 4412 | Gare maritime (marchandises) | non-residentiel | 3 |
| 4413 | Installation portuaire en général | non-residentiel | 60 |
| 4419 | Autres installations portuaires (sauf celles codifiées à 744) | non-residentiel | 25 |
| 4490 | Autres infrastructures de transport maritime | non-residentiel | 20 |
| 4510 | Autoroute | non-residentiel | 210 |
| 4520 | Boulevard | non-residentiel | 1217 |
| 4530 | Artère principale | non-residentiel | 286 |
| 4540 | Artère secondaire | non-residentiel | 5126 |
| 4550 | Rue et avenue pour l’accès local | non-residentiel | 6221 |
| 4561 | Ruelle | non-residentiel | 564 |
| 4562 | Passage | non-residentiel | 1463 |
| 4563 | Piste cyclable en site propre | non-residentiel | 141 |
| 4564 | Bande cyclable juxtaposée à une voie publique | non-residentiel | 9 |
| 4566 | Sentier récréatif de véhicules non motorisés | non-residentiel | 5 |
| 4567 | Sentier récréatif pédestre | non-residentiel | 22 |
| 4590 | Autres routes et voies publiques | non-residentiel | 557 |
| 4611 | Garage de stationnement pour automobiles (infrastructure) | non-residentiel | 63 |
| 4612 | Garage de stationnement pour véhicules lourds (infrastructure) | non-residentiel | 6 |
| 4621 | Terrain de stationnement pour automobiles | non-residentiel | 1462 |
| 4622 | Assiette d’autoroute utilisée à des fins lucratives | non-residentiel | 1 |
| 4623 | Terrain de stationnement pour véhicules lourds | non-residentiel | 53 |
| 4631 | Stationnement intérieur | non-residentiel | 784 |
| 4632 | Stationnement extérieur | non-residentiel | 206 |
| 4633 | Espace de rangement | non-residentiel | 19 |
| 4711 | Centre d'appels téléphoniques | non-residentiel | 61 |
| 4712 | Tour de relais (micro-ondes) | non-residentiel | 56 |
| 4713 | Fournisseurs de services de télécommunications par fil | non-residentiel | 1 |
| 4715 | Services de télécommunications sans fil | non-residentiel | 280 |
| 4719 | Autres services de télécommunications | non-residentiel | 137 |
| 4731 | Studio de radiodiffusion (accueil d’un public) | non-residentiel | 1 |
| 4732 | Station et tour de transmission pour la radio | non-residentiel | 3 |
| 4733 | Studio de radiodiffusion (sans public) | non-residentiel | 6 |
| 4734 | Réseau de radiocommunication par satellite | non-residentiel | 1 |
| 4739 | Autres centres et réseaux radiophoniques | non-residentiel | 1 |
| 4742 | Station et tour de transmission pour la télévision | non-residentiel | 2 |
| 4743 | Studio de télédiffusion (sans public) | non-residentiel | 2 |
| 4746 | Réseau de câblodistributeurs | non-residentiel | 3 |
| 4749 | Autres activités de distribution d'émissions de télévision et de télédiffusion sur réseau | non-residentiel | 6 |
| 4751 | Studio de télévision et de radiodiffusion (système combiné et accueil d’un public) | non-residentiel | 1 |
| 4752 | Studio d’enregistrement de matériel visuel | non-residentiel | 5 |
| 4759 | Autres centres et réseaux de télévision et de radiodiffusion (système combiné) | non-residentiel | 4 |
| 4761 | Studio d’enregistrement du son | non-residentiel | 6 |
| 4762 | Production d'enregistrements sonores (production seulement) | non-residentiel | 1 |
| 4764 | Industrie de l'édition de la musique (publication et impression) | non-residentiel | 1 |
| 4769 | Autres industries de l'enregistrement sonore | non-residentiel | 1 |
| 4771 | Studio de production de films, de vidéos ou de publicités (ne comprend pas le laboratoire de production des films) | non-residentiel | 9 |
| 4781 | Service de traitement des données | non-residentiel | 4 |
| 4782 | Service d'hébergement des données (sites Web, diffusion audio et vidéo en continue, services d'applications) | non-residentiel | 11 |
| 4791 | Service de nouvelles (agence de presse) | non-residentiel | 7 |
| 4792 | Archives | non-residentiel | 1 |
| 4799 | Tous les autres services d'information | non-residentiel | 5 |
| 4811 | Centrale hydraulique ou hydroélectrique | non-residentiel | 71 |
| 4812 | Éolienne | non-residentiel | 4 |
| 4813 | Centrale géothermique | non-residentiel | 1 |
| 4815 |  | non-residentiel | 4 |
| 4819 | Autres activités de production d'énergie | non-residentiel | 18 |
| 4821 | Transport et gestion d'électricité en bloc | non-residentiel | 201 |
| 4822 | Distribution locale d'électricité | non-residentiel | 38 |
| 4823 | Transport et gestion du gaz par canalisation | non-residentiel | 31 |
| 4824 | Centre d'entreposage du gaz | non-residentiel | 15 |
| 4825 | Distribution locale du gaz | non-residentiel | 37 |
| 4826 | Centre d’entreposage de produits pétroliers | non-residentiel | 2 |
| 4827 | Distribution de produits pétroliers | non-residentiel | 2 |
| 4828 | Centre d'entreposage et de distribution des nouveaux carburants | non-residentiel | 1 |
| 4829 | Autres installations de transport, d'entreposage et de distribution d'énergie | non-residentiel | 13 |
| 4831 | Ligne de l’aqueduc | non-residentiel | 9 |
| 4832 | Usine de traitement des eaux | non-residentiel | 30 |
| 4833 | Réservoir d’eau | non-residentiel | 83 |
| 4834 | Station de contrôle de la pression de l’eau | non-residentiel | 169 |
| 4835 | Barrage | non-residentiel | 2 |
| 4839 | Autres services d’aqueduc et d’irrigation | non-residentiel | 257 |
| 4841 | Usine de traitement des eaux usées | non-residentiel | 29 |
| 4842 | Espace pour le séchage des boues provenant de l’usine d’épuration | non-residentiel | 2 |
| 4843 | Station de contrôle de la pression des eaux usées | non-residentiel | 109 |
| 4849 | Autres systèmes d’égouts | non-residentiel | 104 |
| 4851 | Incinérateur | non-residentiel | 4 |
| 4852 | Station centrale de compactage des ordures | non-residentiel | 2 |
| 4853 | Dépôt de matériaux secs | non-residentiel | 5 |
| 4854 | Enfouissement sanitaire | non-residentiel | 2 |
| 4855 | Dépotoir | non-residentiel | 9 |
| 4859 | Autres installations inhérentes aux ordures | non-residentiel | 6 |
| 4871 | Récupération et triage du papier | non-residentiel | 6 |
| 4873 | Récupération et triage du plastique | non-residentiel | 2 |
| 4874 | Récupération et triage de métaux | non-residentiel | 29 |
| 4875 | Récupération et triage de matières polluantes et toxiques | non-residentiel | 8 |
| 4879 | Autres activités de récupération et de triage | non-residentiel | 39 |
| 4880 | Dépôt à neige | non-residentiel | 20 |
| 4890 | Autres services publics (infrastructure) | non-residentiel | 39 |
| 4921 | Service d’envoi de marchandises | non-residentiel | 10 |
| 4922 | Service d’emballage et de protection de marchandises | non-residentiel | 6 |
| 4923 | Centre d'essai pour le transport | non-residentiel | 1 |
| 4926 | Service de messagers | non-residentiel | 6 |
| 4927 | Service de déménagement | non-residentiel | 11 |
| 4928 | Service de remorquage | non-residentiel | 17 |
| 4929 | Autres services pour le transport | non-residentiel | 22 |
| 4990 | Autres transports, communications et services publics (infrastructure) | non-residentiel | 43 |
| 5001 | Centre commercial superrégional | non-residentiel | 22 |
| 5002 | Centre commercial régional | non-residentiel | 44 |
| 5003 | Centre commercial local | non-residentiel | 50 |
| 5004 | Centre commercial de quartier | non-residentiel | 121 |
| 5005 | Centre commercial de voisinage | non-residentiel | 334 |
| 5010 | Immeuble commercial | non-residentiel | 6760 |
| 5020 | Entreposage de tout genre | non-residentiel | 1526 |
| 5030 | Entreprise de télémagasinage et de vente par correspondance | non-residentiel | 3 |
| 5111 | Vente en gros d’automobiles et autres véhicules automobiles, neufs ou d'occasion | non-residentiel | 11 |
| 5112 | Vente en gros de pièces et d’accessoires neufs pour véhicules automobiles | non-residentiel | 36 |
| 5113 | Vente en gros de pièces usagées et d'accessoires d'occasion pour véhicules automobiles | non-residentiel | 5 |
| 5114 | Vente en gros de pneus et de chambres à air | non-residentiel | 10 |
| 5121 | Vente en gros de médicaments et de produits médicamenteux | non-residentiel | 7 |
| 5122 | Vente en gros de peinture et de vernis | non-residentiel | 3 |
| 5123 | Vente en gros de produits de beauté | non-residentiel | 15 |
| 5129 | Vente en gros d’autres médicaments, de produits chimiques et de produits connexes | non-residentiel | 6 |
| 5131 | Vente en gros de tissus et de textiles | non-residentiel | 7 |
| 5132 | Vente en gros de vêtements, de lingerie, de bas et d’accessoires | non-residentiel | 15 |
| 5133 | Vente en gros de chaussures | non-residentiel | 1 |
| 5141 | Vente en gros pour l’épicerie en général | non-residentiel | 20 |
| 5142 | Vente en gros de produits laitiers | non-residentiel | 2 |
| 5143 | Vente en gros de volailles et de produits provenant de la volaille | non-residentiel | 1 |
| 5144 | Vente en gros de confiseries | non-residentiel | 3 |
| 5145 | Vente en gros de produits de boulangerie et de pâtisserie | non-residentiel | 9 |
| 5146 | Vente en gros de poissons et de fruits de mer | non-residentiel | 1 |
| 5147 | Vente en gros de viandes et de produits de la viande | non-residentiel | 9 |
| 5148 | Vente en gros de fruits et de légumes frais | non-residentiel | 10 |
| 5149 | Vente en gros d’autres produits reliés à l’épicerie | non-residentiel | 15 |
| 5151 | Vente en gros du grain | non-residentiel | 3 |
| 5157 | Vente en gros de produits chimiques pour l’agriculture | non-residentiel | 1 |
| 5159 | Vente en gros d’autres produits de la ferme | non-residentiel | 1 |
| 5161 | Vente en gros d’appareils et d’équipements électriques, de fils et de matériel électrique et électronique de construction | non-residentiel | 21 |
| 5162 | Vente en gros d’appareils électriques, de téléviseurs et de radios | non-residentiel | 2 |
| 5163 | Vente en gros de pièces et d’équipements électroniques | non-residentiel | 10 |
| 5164 | Vente en gros de caisses enregistreuses | non-residentiel | 1 |
| 5165 | Vente en gros d'équipements et de logiciels informatiques (incluant jeux et accessoires) | non-residentiel | 2 |
| 5169 | Vente en gros d’autres appareils ou matériel électrique et électronique | non-residentiel | 8 |
| 5171 | Vente en gros de quincaillerie | non-residentiel | 22 |
| 5172 | Vente en gros d’appareils et d’équipements de plomberie et de chauffage | non-residentiel | 31 |
| 5173 | Vente en gros d’équipements et de pièces pour la réfrigération, la ventilation, la climatisation et le chauffage (système combiné) | non-residentiel | 16 |
| 5177 | Vente en gros de pièces et d'équipements destinés aux communications | non-residentiel | 1 |
| 5178 | Vente en gros de pièces et d'équipements destinés à l'énergie | non-residentiel | 4 |
| 5181 | Vente en gros d’équipements et de pièces de machinerie commerciale, industrielle ou agricole (incluant la machinerie lourde) | non-residentiel | 30 |
| 5182 | Vente en gros de machinerie et d’instruments commerciaux, industriels ou agricoles, neufs ou d'occasion (incluant la machinerie lourde) | non-residentiel | 5 |
| 5183 | Vente en gros d’équipements professionnels et de pièces | non-residentiel | 10 |
| 5184 | Vente en gros d’équipements et de pièces pour les entreprises de services | non-residentiel | 14 |
| 5185 | Vente en gros d’équipements et de pièces pour le transport (sauf véhicules automobiles) | non-residentiel | 4 |
| 5186 | Vente en gros d’ameublements, de matériel de bureau et de magasin | non-residentiel | 7 |
| 5187 | Vente en gros de matériel scolaire | non-residentiel | 1 |
| 5189 | Vente en gros d’autres pièces d’équipement ou de machinerie (incluant la machinerie lourde) | non-residentiel | 11 |
| 5191 | Vente en gros de métaux et de minéraux (sauf les produits du pétrole et les rebuts) | non-residentiel | 2 |
| 5192 | Vente en gros de combustible (incluant le bois de chauffage) | non-residentiel | 4 |
| 5193 | Vente en gros de produits du tabac | non-residentiel | 1 |
| 5195 | Vente en gros de la bière, du vin et des boissons alcooliques | non-residentiel | 10 |
| 5196 | Vente en gros de papiers et de produits du papier | non-residentiel | 3 |
| 5197 | Vente en gros de meubles et d’articles d’ameublement de maison | non-residentiel | 5 |
| 5198 | Vente en gros de bois et de matériaux de construction | non-residentiel | 29 |
| 5199 | Autres activités de vente en gros | non-residentiel | 123 |
| 5211 | Vente au détail de matériaux de construction (cour à bois) | non-residentiel | 12 |
| 5212 | Vente au détail de matériaux de construction | non-residentiel | 86 |
| 5220 | Vente au détail d’équipements de plomberie, de chauffage, de ventilation, de climatisation et de foyer | non-residentiel | 58 |
| 5230 | Vente au détail de peinture, de verre et de papier tenture | non-residentiel | 32 |
| 5241 | Vente au détail de matériel électrique | non-residentiel | 12 |
| 5242 | Vente au détail d’appareils et d’accessoires d’éclairage | non-residentiel | 11 |
| 5251 | Vente au détail de quincaillerie | non-residentiel | 69 |
| 5252 | Vente au détail d’équipements de ferme | non-residentiel | 10 |
| 5253 | Vente au détail de serrures, de clés et d’accessoires | non-residentiel | 11 |
| 5260 | Vente au détail de maisons et de chalets préfabriqués (incluant les maisons mobiles) | non-residentiel | 5 |
| 5270 | Vente au détail de produits de béton et de briques | non-residentiel | 6 |
| 5311 | Vente au détail, magasin à rayons | non-residentiel | 34 |
| 5312 | Vente au détail, fournitures pour la maison et l'auto | non-residentiel | 20 |
| 5320 | Vente au détail, clubs de gros et hypermarchés | non-residentiel | 9 |
| 5331 | Vente au détail, variété de marchandises à prix d’escompte | non-residentiel | 23 |
| 5332 | Vente au détail de marchandises d’occasion et marché aux puces | non-residentiel | 9 |
| 5333 | Vente aux enchères ou encan d'oeuvres d'art et de marchandises diverses | non-residentiel | 1 |
| 5340 | Vente au détail par machine distributrice | non-residentiel | 1 |
| 5360 |  | non-residentiel | 1 |
| 5361 | Vente au détail d’articles, d’accessoires d’aménagement paysager et de jardin | non-residentiel | 38 |
| 5362 | Vente au détail de matériaux pour l'aménagement paysager | non-residentiel | 3 |
| 5363 | Vente au détail de matériel motorisé pour l'entretien des pelouses et jardins | non-residentiel | 2 |
| 5370 | Vente au détail de piscines, de spas et leurs accessoires | non-residentiel | 41 |
| 5391 | Vente au détail de marchandises en général (sauf le marché aux puces) | non-residentiel | 36 |
| 5393 | Vente au détail d’ameublement et d’accessoires de bureau | non-residentiel | 15 |
| 5394 | Vente au détail ou location d’articles, d’accessoires de scène et de costumes | non-residentiel | 7 |
| 5395 | Vente au détail de matériaux de récupération (démolition) | non-residentiel | 1 |
| 5396 | Vente au détail de systèmes d’alarme | non-residentiel | 13 |
| 5397 | Vente au détail d’appareils téléphoniques | non-residentiel | 9 |
| 5399 | Autres ventes au détail de marchandises en général | non-residentiel | 53 |
| 5411 | Vente au détail de produits d’épicerie (avec boucherie) | non-residentiel | 243 |
| 5412 | Vente au détail de produits d’épicerie (sans boucherie) | non-residentiel | 86 |
| 5413 | Dépanneur (sans vente d’essence) | non-residentiel | 267 |
| 5421 | Vente au détail de la viande | non-residentiel | 36 |
| 5422 | Vente au détail de poissons et de fruits de mer | non-residentiel | 5 |
| 5431 | Vente au détail de fruits et de légumes | non-residentiel | 13 |
| 5432 | Marché public | non-residentiel | 17 |
| 5440 | Vente au détail de bonbons, d’amandes et de confiseries | non-residentiel | 11 |
| 5450 | Vente au détail de produits laitiers | non-residentiel | 42 |
| 5461 | Vente au détail de produits de la boulangerie et de la pâtisserie (manufacturés sur place en totalité ou non) | non-residentiel | 64 |
| 5462 | Vente au détail de produits de la boulangerie et de la pâtisserie (non manufacturés sur place) | non-residentiel | 10 |
| 5470 | Vente au détail de produits naturels et aliments de régime | non-residentiel | 16 |
| 5492 | Vente au détail du café, du thé, d’épices et d’aromates | non-residentiel | 25 |
| 5499 | Autres activités de vente au détail de produits de l'alimentation | non-residentiel | 70 |
| 5511 | Vente au détail de véhicules automobiles neufs et usagés | non-residentiel | 318 |
| 5512 | Vente au détail de véhicules automobiles usagés seulement | non-residentiel | 181 |
| 5521 | Vente au détail de pneus, de batteries et d’accessoires | non-residentiel | 27 |
| 5522 | Vente au détail de pneus seulement | non-residentiel | 16 |
| 5523 | Vente au détail de pièces de véhicules automobiles et d'accessoires | non-residentiel | 13 |
| 5531 | Station-service avec réparation de véhicules automobiles | non-residentiel | 78 |
| 5532 | Station libre-service, ou avec service sans réparation de véhicules automobiles | non-residentiel | 91 |
| 5533 | Station libre-service, ou avec service et dépanneur sans réparation de véhicules automobiles | non-residentiel | 507 |
| 5539 | Autres stations-services | non-residentiel | 1 |
| 5591 | Vente au détail d’embarcations et d’accessoires | non-residentiel | 13 |
| 5593 | Vente au détail de pièces de véhicules automobiles et d’accessoires usagés | non-residentiel | 74 |
| 5594 | Vente au détail de motocyclettes, de motoneiges et de leurs accessoires | non-residentiel | 42 |
| 5595 | Vente au détail de véhicules récréatifs et de roulottes de tourisme | non-residentiel | 26 |
| 5596 | Vente au détail de tondeuses, de souffleuses et leurs accessoires | non-residentiel | 9 |
| 5597 | Vente au détail de machinerie lourde | non-residentiel | 10 |
| 5598 | Vente au détail de pièces et accessoires de machinerie lourde | non-residentiel | 5 |
| 5599 | Autres activités de vente au détail reliées aux automobiles, aux embarcations, aux avions et à leurs accessoires | non-residentiel | 17 |
| 5610 | Vente au détail de vêtements et d’accessoires pour hommes | non-residentiel | 22 |
| 5620 | Vente au détail de vêtements prêts-à-porter pour femmes | non-residentiel | 24 |
| 5631 | Vente au détail d’accessoires pour femmes | non-residentiel | 6 |
| 5632 | Vente au détail en kiosque de vêtements et d'accessoires de vêtements | non-residentiel | 1 |
| 5640 | Vente au détail de lingerie pour enfants | non-residentiel | 7 |
| 5651 | Vente au détail de vêtements pour toute la famille | non-residentiel | 27 |
| 5652 | Vente au détail de vêtements unisexes | non-residentiel | 14 |
| 5653 | Vente au détail de vêtements en cuir | non-residentiel | 3 |
| 5660 | Vente au détail de chaussures | non-residentiel | 25 |
| 5670 | Vente au détail de complets sur mesure | non-residentiel | 1 |
| 5680 | Vente au détail de vêtements de fourrure | non-residentiel | 6 |
| 5691 | Vente au détail de tricots, de lainages et d’accessoires divers | non-residentiel | 3 |
| 5692 | Vente au détail d’équipements et d’accessoires de couture | non-residentiel | 3 |
| 5693 | Vente au détail de vêtements et d’articles usagés (sauf le marché aux puces) | non-residentiel | 24 |
| 5699 | Autres activités de vente au détail de vêtements, comme les accessoires | non-residentiel | 23 |
| 5711 | Vente au détail de meubles | non-residentiel | 86 |
| 5712 | Vente au détail de revêtements de planchers et de murs | non-residentiel | 49 |
| 5713 | Vente au détail de tentures, de rideaux et de stores | non-residentiel | 9 |
| 5714 | Vente au détail de vaisselle, de verrerie et d’accessoires en métal | non-residentiel | 2 |
| 5716 | Vente au détail de lits d’eau | non-residentiel | 2 |
| 5717 | Vente au détail d’armoires, de coiffeuses et de meubles d'appoint | non-residentiel | 7 |
| 5719 | Vente au détail d’autres équipements ménagers et d’ameublement | non-residentiel | 19 |
| 5721 | Vente au détail d’appareils ménagers | non-residentiel | 21 |
| 5722 | Vente au détail d’aspirateurs et leurs accessoires | non-residentiel | 3 |
| 5731 | Vente au détail de radios, de téléviseurs, de systèmes de son et d'appareils électroniques | non-residentiel | 14 |
| 5732 | Vente au détail d’instruments de musique | non-residentiel | 15 |
| 5733 | Vente au détail de disques et de cassettes (sauf pour informatique) | non-residentiel | 4 |
| 5740 | Vente au détail d’équipements et de logiciels informatiques (incluant jeux et accessoires) | non-residentiel | 20 |
| 5811 | Restaurant et établissement avec service complet (sans terrasse) | non-residentiel | 691 |
| 5812 | Restaurant et établissement avec service complet (avec terrasse) | non-residentiel | 417 |
| 5813 | Restaurant et établissement avec service restreint | non-residentiel | 311 |
| 5814 | Restaurant et établissement offrant des repas à libre-service (cafétéria, cantine) | non-residentiel | 38 |
| 5815 | Établissement avec salle de réception ou de banquet | non-residentiel | 11 |
| 5819 | Autres établissements avec service complet ou restreint | non-residentiel | 49 |
| 5821 | Établissement avec service de boissons alcoolisées (bar) | non-residentiel | 149 |
| 5822 | Établissement dont l’activité principale est la danse | non-residentiel | 9 |
| 5823 | Bar à spectacles | non-residentiel | 25 |
| 5829 | Autres établissements de débits de boissons alcoolisées | non-residentiel | 2 |
| 5831 | Hôtel (incluant les hôtels-motels) | non-residentiel | 1167 |
| 5832 | Motel | non-residentiel | 75 |
| 5833 | Auberge ou gîte touristique | non-residentiel | 124 |
| 5834 | Résidence de tourisme, appartement, maison ou chalet (meublé et équipé pour repas) | non-residentiel | 482 |
| 5835 | Hébergement touristique à la ferme | non-residentiel | 1 |
| 5836 | Immeuble à temps partagé (« time share ») | non-residentiel | 164 |
| 5839 | Autres activités d'hébergement | non-residentiel | 9 |
| 5891 | Traiteurs | non-residentiel | 41 |
| 5892 | Comptoir fixe (frites, burger, hot-dogs ou crème glacée) | non-residentiel | 16 |
| 5899 | Autres activités de la restauration | non-residentiel | 50 |
| 5911 | Vente au détail de médicaments et d’articles divers (pharmacies) | non-residentiel | 161 |
| 5912 | Vente au détail d’articles de soins personnels et de produits de beauté | non-residentiel | 9 |
| 5913 | Vente au détail d’instruments et de matériel médical | non-residentiel | 10 |
| 5921 | Vente au détail de boissons alcoolisées | non-residentiel | 34 |
| 5924 | Vente au détail de fournitures pour la fabrication de produits alcoolisées | non-residentiel | 5 |
| 5931 | Vente au détail d’antiquités (sauf le marché aux puces) | non-residentiel | 14 |
| 5932 | Vente au détail de marchandises d’occasion | non-residentiel | 12 |
| 5933 | Vente au détail de produits artisanaux, locaux ou régionaux | non-residentiel | 20 |
| 5941 | Vente au détail de livres et de journaux | non-residentiel | 17 |
| 5942 | Vente au détail de livres et de papeterie | non-residentiel | 22 |
| 5943 | Vente au détail de papeterie | non-residentiel | 6 |
| 5945 | Vente au détail d’articles liturgiques | non-residentiel | 2 |
| 5946 | Vente au détail de fournitures pour artistes, de cadres et de tableaux (incluant laminage et montage) | non-residentiel | 12 |
| 5947 | Vente au détail d'œuvres d'art | non-residentiel | 1 |
| 5951 | Vente au détail d’articles de sport | non-residentiel | 63 |
| 5952 | Vente au détail de bicyclettes | non-residentiel | 34 |
| 5953 | Vente au détail de jouets et d’articles de jeux | non-residentiel | 7 |
| 5954 | Vente au détail de trophées et d’accessoires | non-residentiel | 3 |
| 5955 | Vente au détail d’équipements et d’accessoires de chasse et pêche | non-residentiel | 6 |
| 5961 | Vente au détail de foin, de grain et de mouture | non-residentiel | 1 |
| 5965 | Vente au détail d’animaux de maison (animalerie) | non-residentiel | 26 |
| 5969 | Vente au détail d’autres articles de ferme | non-residentiel | 2 |
| 5971 | Vente au détail de bijoux | non-residentiel | 22 |
| 5981 | Vente au détail de combustibles incluant le bois de chauffage | non-residentiel | 6 |
| 5982 | Vente au détail du mazout (sauf les stations-services) | non-residentiel | 7 |
| 5983 | Vente au détail de gaz sous pression | non-residentiel | 18 |
| 5990 | Vente au détail de cannabis et de produits du cannabis | non-residentiel | 3 |
| 5991 | Vente au détail (fleuriste) | non-residentiel | 29 |
| 5992 | Vente au détail de monuments funéraires et de pierres tombales | non-residentiel | 3 |
| 5993 | Vente au détail de produits du tabac, de journaux, de revues et de menus articles (tabagie) | non-residentiel | 57 |
| 5994 | Vente au détail de caméras et d’articles de photographie | non-residentiel | 5 |
| 5995 | Vente au détail de cadeaux, de souvenirs et de menus objets | non-residentiel | 26 |
| 5996 | Vente au détail d’appareils d’optique | non-residentiel | 4 |
| 5997 | Vente au détail d’appareils orthopédiques et articles spécialisés de santé | non-residentiel | 17 |
| 5998 | Vente au détail de bagages et d’articles en cuir | non-residentiel | 3 |
| 5999 | Autres activités de vente au détail | non-residentiel | 390 |
| 6000 | Immeuble à bureaux | non-residentiel | 2521 |
| 6111 | Service bancaire (dépôts et prêts, incluant les banques à charte) | non-residentiel | 195 |
| 6112 | Services spécialisés reliés à l’activité bancaire | non-residentiel | 11 |
| 6113 | Guichet automatique | non-residentiel | 5 |
| 6121 | Association, union ou coop d’épargne et de prêt (incluant les caisses populaires locales) | non-residentiel | 13 |
| 6122 | Service de crédit agricole, commercial et individuel | non-residentiel | 1 |
| 6123 | Service de prêts sur gages | non-residentiel | 1 |
| 6129 | Autres services de crédit | non-residentiel | 4 |
| 6131 | Maison de courtiers et de négociants en valeurs mobilières et émissions d’obligations | non-residentiel | 9 |
| 6132 | Maison de courtiers et de négociants de marchandises | non-residentiel | 8 |
| 6139 | Autres services connexes aux valeurs mobilières et aux marchandises | non-residentiel | 2 |
| 6141 | Agence et courtier d'assurances | non-residentiel | 35 |
| 6142 |  | non-residentiel | 1 |
| 6149 | Autres activités reliées à l'assurance | non-residentiel | 3 |
| 6151 | Exploitation de biens immobiliers (sauf le développement) | non-residentiel | 22 |
| 6152 | Maison d’agents, de courtiers et de services d’administration des biens-fonds | non-residentiel | 45 |
| 6153 | Service de lotissement et de développement des biens-fonds | non-residentiel | 2 |
| 6154 | Construction d’immeubles pour revente | non-residentiel | 9 |
| 6155 | Service conjoint de biens-fonds, d'assurance, d'hypothèques et de lois | non-residentiel | 2 |
| 6160 | Service de holding, d’investissement et de fiducie | non-residentiel | 9 |
| 6191 | Service relié à la fiscalité | non-residentiel | 17 |
| 6199 | Autres services immobiliers, financiers et d’assurance | non-residentiel | 95 |
| 6211 | Service de buanderie, de nettoyage à sec et de teinture (sauf les tapis) | non-residentiel | 26 |
| 6212 | Service de lingerie et de buanderie industrielle | non-residentiel | 18 |
| 6214 | Service de buanderie et de nettoyage à sec (libre-service) | non-residentiel | 13 |
| 6215 | Service de nettoyage et de réparation de tapis | non-residentiel | 2 |
| 6219 | Autres services de nettoyage | non-residentiel | 11 |
| 6221 | Service photographique (incluant les services commerciaux) | non-residentiel | 18 |
| 6222 | Service de finition de photographies | non-residentiel | 1 |
| 6231 | Salon de beauté | non-residentiel | 82 |
| 6232 | Salon de coiffure | non-residentiel | 171 |
| 6233 | Salon capillaire | non-residentiel | 3 |
| 6234 | Salon de bronzage ou de massage | non-residentiel | 27 |
| 6239 | Autres services de soins personnels | non-residentiel | 32 |
| 6241 | Salon funéraire | non-residentiel | 79 |
| 6242 | Cimetière | non-residentiel | 118 |
| 6243 | Mausolée | non-residentiel | 8 |
| 6244 | Crématorium | non-residentiel | 3 |
| 6249 | Autres services funèbres | non-residentiel | 3 |
| 6251 | Pressage de vêtements | non-residentiel | 4 |
| 6252 | Service de réparation et d’entreposage de fourrure | non-residentiel | 1 |
| 6253 | Service d'entretien de chaussures et d'articles de cuir (cordonnerie) | non-residentiel | 8 |
| 6254 | Modification et réparation de vêtements | non-residentiel | 3 |
| 6261 | Service de garde pour animaux domestiques (sauf chenil d'élevage) | non-residentiel | 5 |
| 6262 | École de dressage pour animaux domestiques | non-residentiel | 4 |
| 6263 | Service de toilettage pour animaux domestiques | non-residentiel | 16 |
| 6269 | Autres services pour animaux domestiques | non-residentiel | 12 |
| 6299 | Autres services personnels | non-residentiel | 146 |
| 6311 | Service de publicité en général | non-residentiel | 31 |
| 6312 | Service d'affichage à l'extérieur | non-residentiel | 265 |
| 6319 | Autres services publicitaires | non-residentiel | 16 |
| 6320 | Bureau de crédit pour les commerces et les consommateurs et service de recouvrement | non-residentiel | 5 |
| 6332 | Service de photocopie et de reprographie | non-residentiel | 14 |
| 6333 | Service d'impression numérique | non-residentiel | 15 |
| 6336 | Service de soutien au bureau (télécopie, location d'ordinateurs personnels) | non-residentiel | 2 |
| 6339 | Autres services de soutien aux entreprises | non-residentiel | 16 |
| 6341 | Service de nettoyage de fenêtres | non-residentiel | 1 |
| 6342 | Service d'extermination et de désinfection | non-residentiel | 11 |
| 6343 | Service pour l'entretien ménager | non-residentiel | 26 |
| 6344 | Service d'aménagement paysager ou de déneigement | non-residentiel | 119 |
| 6346 | Service de cueillette des ordures | non-residentiel | 7 |
| 6347 | Service de vidange de fosses septiques et de location de toilettes portatives | non-residentiel | 5 |
| 6348 | Service d'assainissement de l'environnement | non-residentiel | 9 |
| 6349 | Autres services pour les bâtiments | non-residentiel | 29 |
| 6351 | Service de location de films, de jeux vidéo et de matériel audiovisuel | non-residentiel | 7 |
| 6352 | Service de location d'outils ou d’équipements | non-residentiel | 87 |
| 6353 | Service de location d’automobiles | non-residentiel | 17 |
| 6354 | Service de location de machinerie lourde | non-residentiel | 9 |
| 6355 | Service de location de camions, de remorques utilitaires et de véhicules de plaisance | non-residentiel | 29 |
| 6356 | Service de location d'embarcations nautiques | non-residentiel | 3 |
| 6359 | Autres services de location (sauf entreposage) | non-residentiel | 17 |
| 6361 | Centre de recherche en environnement et ressources naturelles | non-residentiel | 2 |
| 6365 | Centre de recherche en science physique et chimique | non-residentiel | 3 |
| 6368 | Centre de recherche d'activités émergentes | non-residentiel | 2 |
| 6369 | Autres centres de recherche | non-residentiel | 6 |
| 6371 | Entreposage de produits de la ferme (sauf l’entreposage en vrac à l’extérieur) et silos | non-residentiel | 4 |
| 6372 | Entreposage en vrac à l’extérieur | non-residentiel | 115 |
| 6373 | Entreposage frigorifique (sauf les armoires frigorifiques) | non-residentiel | 70 |
| 6375 | Entreposage du mobilier et d’appareils ménagers, incluant les mini-entrepôts | non-residentiel | 76 |
| 6376 | Centre de distribution ou d'expédition de marchandises diverses (colis, courrier, meubles, etc.) | non-residentiel | 104 |
| 6378 | Centre de transfert ou d'entreposage de déchets dangereux | non-residentiel | 1 |
| 6379 | Autres entreposages | non-residentiel | 1186 |
| 6381 | Service de secrétariat et de traitement de textes | non-residentiel | 7 |
| 6382 | Service de traduction | non-residentiel | 1 |
| 6383 | Service d'agence de placement | non-residentiel | 13 |
| 6391 | Service de recherche, de développement et d’essais | non-residentiel | 65 |
| 6392 | Service de consultation en administration et en gestion des affaires | non-residentiel | 20 |
| 6393 | Service de protection et de détectives (incluant les voitures blindées) | non-residentiel | 3 |
| 6394 |  | non-residentiel | 1 |
| 6395 | Agence de voyages ou d'expéditions | non-residentiel | 25 |
| 6399 | Autres services d’affaires | non-residentiel | 438 |
| 6411 | Service de réparation d’automobiles (garage) | non-residentiel | 913 |
| 6412 | Service de lavage d’automobiles | non-residentiel | 75 |
| 6413 | Service de débosselage et de peinture d’automobiles | non-residentiel | 233 |
| 6414 | Centre de vérification technique d’automobiles et d’estimation | non-residentiel | 11 |
| 6415 | Service de remplacement de pièces et d’accessoires d’automobiles | non-residentiel | 103 |
| 6416 | Service de traitement pour automobiles (antirouille, etc.) | non-residentiel | 15 |
| 6417 | Service de lavage de véhicules lourds (incluant les autobus) | non-residentiel | 6 |
| 6418 | Service de réparation et remplacement de pneus | non-residentiel | 13 |
| 6419 | Autres services de l’automobile | non-residentiel | 493 |
| 6421 | Service de réparation d’accessoires électriques | non-residentiel | 14 |
| 6422 | Service de réparation et d'entretien de radios, de téléviseurs, d'appareils électroniques et d'instruments de précision | non-residentiel | 5 |
| 6423 | Service de réparation et de rembourrage de meubles | non-residentiel | 29 |
| 6424 | Service de réparation et d’entretien de systèmes de plomberie, de chauffage, de ventilation et de climatisation (entrepreneur spécialisé) | non-residentiel | 48 |
| 6425 | Service de réparation et d'entretien de machines et de matériel d'usage commercial et industriel | non-residentiel | 21 |
| 6431 | Service de réparation de véhicules légers motorisés (motocyclette, motoneige, véhicule tout terrain) | non-residentiel | 12 |
| 6439 | Service de réparation d’autres véhicules légers | non-residentiel | 8 |
| 6441 | Service de réparation et d'entretien de véhicules lourds | non-residentiel | 52 |
| 6442 | Service de débosselage et de peinture de véhicules lourds | non-residentiel | 2 |
| 6493 | Service de réparation de montres, d’horloges et bijouterie | non-residentiel | 1 |
| 6495 | Service de réparation de bobines et de moteurs électriques | non-residentiel | 12 |
| 6496 | Service de réparation et d’entretien de matériel informatique | non-residentiel | 12 |
| 6497 | Service d’affûtage d’articles de maison | non-residentiel | 3 |
| 6498 | Service de soudure | non-residentiel | 22 |
| 6499 | Autres services de réparation et d'entretien d'articles personnels et ménagers | non-residentiel | 70 |
| 6511 | Service médical (cabinet de médecins et chirurgiens spécialisés) | non-residentiel | 61 |
| 6512 | Service dentaire (incluant chirurgie et hygiène) | non-residentiel | 229 |
| 6513 | Service d’hôpital | non-residentiel | 72 |
| 6514 | Service de laboratoire médical | non-residentiel | 11 |
| 6515 | Service de laboratoire dentaire | non-residentiel | 31 |
| 6516 | Sanatorium, maison de convalescence et maison de repos | non-residentiel | 5 |
| 6517 | Clinique médicale (cabinet de médecins généralistes) | non-residentiel | 124 |
| 6518 | Service d’optométrie | non-residentiel | 35 |
| 6519 | Autres services médicaux et de santé | non-residentiel | 128 |
| 6521 | Service d’avocats | non-residentiel | 101 |
| 6522 | Service de notaires | non-residentiel | 61 |
| 6523 | Service de huissiers | non-residentiel | 7 |
| 6531 | Centre d’accueil ou établissement curatif | non-residentiel | 107 |
| 6532 | Centre local de services communautaires (C.L.S.C.) | non-residentiel | 32 |
| 6533 | Centre de services sociaux (C.S.S. et C.R.S.S.S.) | non-residentiel | 31 |
| 6534 | Centre d'entraide et de ressources communautaires (incluant ressources d'hébergement, de meubles et d'alimentation) | non-residentiel | 67 |
| 6539 | Autres centres de services sociaux ou bureaux de travailleurs sociaux | non-residentiel | 72 |
| 6541 | Service de garderie (prématernelle, moins de 50 % de poupons) | non-residentiel | 995 |
| 6542 | Maison pour personnes en difficulté | non-residentiel | 126 |
| 6543 | Pouponnière ou garderie de nuit | non-residentiel | 2 |
| 6551 | Service informatique | non-residentiel | 72 |
| 6552 |  | non-residentiel | 1 |
| 6553 | Service de conception de sites Web Internet | non-residentiel | 10 |
| 6554 | Fournisseur d'accès ou de connexions Internet | non-residentiel | 2 |
| 6561 | Service d’acupuncture | non-residentiel | 8 |
| 6563 | Salon d’esthétique | non-residentiel | 37 |
| 6564 | Service de podiatrie | non-residentiel | 10 |
| 6565 | Service d’orthopédie | non-residentiel | 2 |
| 6569 | Autres services de soins paramédicaux | non-residentiel | 13 |
| 6571 | Service de chiropratique | non-residentiel | 53 |
| 6572 | Service de physiothérapie, d'ergothérapie, d'orthophonie et d'audiologie | non-residentiel | 38 |
| 6573 | Service en santé mentale (cabinet) | non-residentiel | 22 |
| 6579 | Autres services de soins thérapeutiques | non-residentiel | 30 |
| 6591 | Service d’architecture | non-residentiel | 48 |
| 6592 | Service de génie | non-residentiel | 71 |
| 6593 | Service éducationnel et de recherche scientifique | non-residentiel | 10 |
| 6594 | Service de comptabilité, de vérification et de tenue de livres | non-residentiel | 107 |
| 6595 | Service d’évaluation foncière ou d'estimation immobilière | non-residentiel | 13 |
| 6596 | Service d’arpenteurs-géomètres | non-residentiel | 15 |
| 6597 | Service d’urbanisme et de l’environnement | non-residentiel | 7 |
| 6598 | Service de vétérinaires (animaux domestiques) | non-residentiel | 82 |
| 6599 | Autres services professionnels | non-residentiel | 144 |
| 6611 | Service de construction résidentielle (entrepreneur général) | non-residentiel | 96 |
| 6612 | Service de construction non résidentielle, industrielle (entrepreneur général) | non-residentiel | 96 |
| 6613 | Service de construction non résidentielle, commerciale et institutionnelle (entrepreneur général) | non-residentiel | 54 |
| 6614 | Service de montage de charpentes d'acier et mise en place de béton préfabriqué | non-residentiel | 4 |
| 6615 | Service de charpenterie et de grosse menuiserie (entrepreneur spécialisé) | non-residentiel | 2 |
| 6616 | Service d’estimation de dommages aux immeubles (experts en sinistre) | non-residentiel | 8 |
| 6619 | Autres services de construction de bâtiments | non-residentiel | 48 |
| 6621 | Service de revêtement en asphalte et en bitume | non-residentiel | 28 |
| 6622 | Service de construction pour ouvrage d’art (entrepreneur général) | non-residentiel | 2 |
| 6623 | Service de construction de routes, de rues et de ponts, de trottoirs et de pistes (entrepreneur général) | non-residentiel | 26 |
| 6625 | Service de construction d'oléoducs, de gazoducs et structures connexes | non-residentiel | 1 |
| 6629 | Autres services de génie civil (entrepreneur général) | non-residentiel | 37 |
| 6631 | Service de plomberie, de chauffage, de climatisation et de ventilation (entrepreneur spécialisé) | non-residentiel | 124 |
| 6632 | Service de peinture, posage de papier teint, décoration des bâtiments et peinture des ouvrages de génie (entrepreneur spécialisé) | non-residentiel | 27 |
| 6633 | Service de travaux d’électricité et d'installation de câblage (entrepreneur spécialisé) | non-residentiel | 87 |
| 6634 | Service de maçonnerie (entrepreneur spécialisé) | non-residentiel | 23 |
| 6635 | Service de petite menuiserie de finition (entrepreneur spécialisé) | non-residentiel | 9 |
| 6636 | Plâtrage, stucage et tirage de joints (entrepreneur spécialisé) | non-residentiel | 4 |
| 6637 | Service d'installation de cloisons sèches et travaux d’isolation (entrepreneur spécialisé) | non-residentiel | 18 |
| 6638 | Service de revêtements de sol (entrepreneur spécialisé) | non-residentiel | 3 |
| 6639 | Autres services de travaux de finition de bâtiment (entrepreneur spécialisé) | non-residentiel | 42 |
| 6641 | Service de travaux de toiture (entrepreneur spécialisé) | non-residentiel | 48 |
| 6642 | Service de pose et réparation de parements métalliques et autres (entrepreneur spécialisé) | non-residentiel | 13 |
| 6643 | Service en travaux de fondations et de structures de béton (entrepreneur spécialisé) | non-residentiel | 39 |
| 6644 | Service de forage de puits, eau | non-residentiel | 10 |
| 6645 | Pose de carreaux de céramique, de marbre, de mosaïque, de pierre (à l'intérieur seulement) et terrazzo | non-residentiel | 6 |
| 6646 | Entreprise d’excavation, de nivellement, de défrichage et installations de fosses septiques | non-residentiel | 111 |
| 6647 | Démolition de bâtiments et autres ouvrages | non-residentiel | 4 |
| 6648 | Service de pose de portes, de fenêtres et de panneaux de verre | non-residentiel | 20 |
| 6649 | Autres services de travaux de construction spécialisés | non-residentiel | 136 |
| 6651 | Installation d'équipements mécaniques, de chaudières et tubulures | non-residentiel | 3 |
| 6652 | Installation d'extincteurs automatiques | non-residentiel | 2 |
| 6653 | Installation d'équipements de réfrigération commerciale | non-residentiel | 1 |
| 6654 | Installation d'ascenseurs et d'escaliers roulants | non-residentiel | 2 |
| 6655 | Installation d'autres équipements techniques | non-residentiel | 1 |
| 6656 | Installation de clôtures et de pavés autobloquants | non-residentiel | 9 |
| 6657 | Pose résidentielle et commerciale de revêtements | non-residentiel | 3 |
| 6658 | Construction, réparation et entretien d'ouvrages reliés à l'énergie et aux communications | non-residentiel | 1 |
| 6659 | Autres services de travaux spécialisés en équipement | non-residentiel | 29 |
| 6711 | Administration publique fédérale | non-residentiel | 15 |
| 6712 | Administration publique provinciale | non-residentiel | 24 |
| 6713 | Administration publique municipale et régionale | non-residentiel | 62 |
| 6721 | Service de police fédérale et activités connexes | non-residentiel | 18 |
| 6722 | Protection contre l’incendie et activités connexes | non-residentiel | 107 |
| 6723 | Défense civile et activités connexes | non-residentiel | 1 |
| 6724 | Service de police provinciale et activités connexes | non-residentiel | 6 |
| 6725 | Service de police municipale et activités connexes | non-residentiel | 22 |
| 6729 | Autres fonctions préventives et activités connexes | non-residentiel | 5 |
| 6731 | Bureau de poste | non-residentiel | 18 |
| 6732 | Comptoir postal | non-residentiel | 4 |
| 6733 | Centre de tri postal | non-residentiel | 24 |
| 6741 | Prison fédérale | non-residentiel | 1 |
| 6742 | Maison de réhabilitation | non-residentiel | 16 |
| 6743 | Prison provinciale | non-residentiel | 8 |
| 6749 | Autres établissements de détention et institutions correctionnelles | non-residentiel | 5 |
| 6751 | Base d’entraînement militaire | non-residentiel | 3 |
| 6752 | Installation de défense militaire | non-residentiel | 1 |
| 6753 | Centre militaire de transport et d’entreposage | non-residentiel | 3 |
| 6754 | Centre militaire d’entretien | non-residentiel | 1 |
| 6755 | Centre militaire d’administration et de commandement | non-residentiel | 1 |
| 6759 | Autres bases et réserves militaires | non-residentiel | 14 |
| 6760 | Organisation internationale et autres organismes extraterritoriaux | non-residentiel | 7 |
| 6791 | Poste et bureau de douanes | non-residentiel | 6 |
| 6799 | Autres services gouvernementaux | non-residentiel | 74 |
| 6811 | École maternelle | non-residentiel | 8 |
| 6812 | École élémentaire | non-residentiel | 820 |
| 6813 | École secondaire | non-residentiel | 268 |
| 6814 | École à caractère familial | non-residentiel | 1 |
| 6815 | École élémentaire et secondaire | non-residentiel | 17 |
| 6816 | Commission scolaire | non-residentiel | 14 |
| 6821 | Université | non-residentiel | 89 |
| 6822 | École polyvalente | non-residentiel | 32 |
| 6823 | CEGEP (collège d’enseignement général et professionnel) | non-residentiel | 57 |
| 6831 | École de métiers (non intégrée aux polyvalentes) | non-residentiel | 49 |
| 6832 | École commerciale et de secrétariat (non intégrée aux polyvalentes) | non-residentiel | 5 |
| 6833 | École de coiffure, d’esthétique et d’apprentissage de soins de beauté (non intégrée aux polyvalentes) | non-residentiel | 6 |
| 6834 | École de beaux-arts et de musique | non-residentiel | 34 |
| 6835 | École de danse | non-residentiel | 22 |
| 6836 | École de conduite automobile (non intégrée aux polyvalentes) | non-residentiel | 8 |
| 6839 | Autres institutions de formation spécialisée | non-residentiel | 116 |
| 6911 | Église, synagogue, mosquée et temple | non-residentiel | 946 |
| 6919 | Autres activités religieuses | non-residentiel | 77 |
| 6920 | Fondations et organismes de charité | non-residentiel | 188 |
| 6991 | Association d’affaires | non-residentiel | 9 |
| 6992 | Association de personnes exerçant une même profession ou une même activité | non-residentiel | 19 |
| 6993 | Syndicat et organisation similaire | non-residentiel | 39 |
| 6994 | Association civique, sociale et fraternelle | non-residentiel | 130 |
| 6995 | Service de laboratoire autre que médical | non-residentiel | 10 |
| 6996 | Bureau d'information pour tourisme | non-residentiel | 2 |
| 6997 | Centre communautaire ou de quartier (incluant centre diocésain) | non-residentiel | 48 |
| 6999 | Autres services divers | non-residentiel | 91 |
| 7111 | Bibliothèque | non-residentiel | 71 |
| 7112 | Musée | non-residentiel | 36 |
| 7113 | Galerie d’art | non-residentiel | 29 |
| 7114 | Salle d’exposition | non-residentiel | 13 |
| 7116 | Musée du patrimoine | non-residentiel | 9 |
| 7117 | Atelier d'artiste ou d'artisan | non-residentiel | 22 |
| 7119 | Autres activités culturelles | non-residentiel | 61 |
| 7121 | Planétarium | non-residentiel | 1 |
| 7122 | Aquarium | non-residentiel | 1 |
| 7123 | Jardin botanique | non-residentiel | 2 |
| 7129 | Autres présentations d’objets ou d’animaux | non-residentiel | 2 |
| 7191 | Monument et site historique | non-residentiel | 35 |
| 7199 | Autres expositions d’objets culturels | non-residentiel | 7 |
| 7211 | Amphithéâtre et auditorium | non-residentiel | 9 |
| 7212 | Cinéma | non-residentiel | 8 |
| 7213 | Ciné-parc | non-residentiel | 2 |
| 7214 | Théâtre | non-residentiel | 40 |
| 7219 | Autres lieux d’assemblée pour les loisirs | non-residentiel | 38 |
| 7221 | Stade | non-residentiel | 2 |
| 7222 | Centre sportif multidisciplinaire (couvert) | non-residentiel | 37 |
| 7223 | Piste de course | non-residentiel | 2 |
| 7225 | Hippodrome | non-residentiel | 1 |
| 7229 | Autres installations pour les sports | non-residentiel | 14 |
| 7233 | Salle de réunions, centre de conférences et congrès | non-residentiel | 6 |
| 7239 | Autres aménagements publics pour différentes activités | non-residentiel | 61 |
| 7290 | Autres aménagements d'assemblées publiques | non-residentiel | 57 |
| 7311 | Parc d’exposition (extérieur) | non-residentiel | 5 |
| 7312 | Parc d’amusement (extérieur) | non-residentiel | 56 |
| 7314 | Parc d’amusement (intérieur) | non-residentiel | 4 |
| 7392 | Golf miniature | non-residentiel | 6 |
| 7393 | Terrain de golf pour exercice seulement | non-residentiel | 11 |
| 7394 | Piste de karting | non-residentiel | 2 |
| 7396 | Salle de billard | non-residentiel | 6 |
| 7399 | Autres lieux d’amusement | non-residentiel | 11 |
| 7411 | Terrain de golf (sans chalet et autres aménagements sportifs) | non-residentiel | 6 |
| 7412 | Terrain de golf (avec chalet et autres aménagements sportifs) | non-residentiel | 56 |
| 7413 | Salle et terrain de squash, de raquetball et de tennis | non-residentiel | 8 |
| 7414 | Centre de tir pour armes à feu | non-residentiel | 5 |
| 7415 | Patinage à roulettes | non-residentiel | 1 |
| 7416 | Équitation | non-residentiel | 8 |
| 7417 | Salle ou salon de quilles | non-residentiel | 22 |
| 7419 | Autres activités sportives | non-residentiel | 17 |
| 7421 | Terrain d’amusement | non-residentiel | 214 |
| 7422 | Terrain de jeux | non-residentiel | 99 |
| 7423 | Terrain de sport | non-residentiel | 147 |
| 7424 | Centre récréatif en général | non-residentiel | 159 |
| 7425 | Gymnase et formation athlétique | non-residentiel | 60 |
| 7429 | Autres terrains de jeux et pistes athlétiques | non-residentiel | 8 |
| 7431 | Plage | non-residentiel | 1 |
| 7432 | Piscine intérieure et activités connexes | non-residentiel | 22 |
| 7433 | Piscine extérieure et activités connexes | non-residentiel | 65 |
| 7441 | Marina, port de plaisance et quai d'embarquement pour croisière (excluant les traversiers) | non-residentiel | 7 |
| 7442 | Rampe d'accès et stationnement | non-residentiel | 4 |
| 7445 | Service d'entretien, de réparation et d'hivernage d'embarcations | non-residentiel | 1 |
| 7449 | Autres activités nautiques | non-residentiel | 15 |
| 7451 | Aréna et activités connexes (patinage sur glace) | non-residentiel | 77 |
| 7452 | Salle de curling | non-residentiel | 6 |
| 7459 | Autres activités sur glace | non-residentiel | 1 |
| 7491 | Camping (excluant le caravaning) | non-residentiel | 15 |
| 7492 | Camping sauvage et pique-nique | non-residentiel | 1 |
| 7493 | Camping et caravaning | non-residentiel | 3 |
| 7499 | Autres activités récréatives | non-residentiel | 50 |
| 7511 | Centre touristique en général | non-residentiel | 2 |
| 7512 | Centre de santé (incluant saunas, spas et bains thérapeutiques ou turcs) | non-residentiel | 6 |
| 7513 | Centre de ski (alpin et/ou de fond) | non-residentiel | 12 |
| 7519 | Autres centres d’activités touristiques | non-residentiel | 11 |
| 7521 | Camp de groupes et base de plein air avec dortoir | non-residentiel | 2 |
| 7522 | Camp de groupes et base de plein air sans dortoir | non-residentiel | 2 |
| 7611 | Parc pour la récréation en général | non-residentiel | 1029 |
| 7612 | Belvédère, halte et relais routier ou station d'interprétation | non-residentiel | 25 |
| 7613 | Parc pour animaux domestiques ou de compagnie | non-residentiel | 2 |
| 7620 | Parc à caractère récréatif et ornemental | non-residentiel | 852 |
| 7631 | Jardin communautaire | non-residentiel | 9 |
| 7639 | Autres parcs | non-residentiel | 271 |
| 7920 | Loterie et jeu de hasard | non-residentiel | 4 |
| 7990 | Loisir et autres activités culturelles | non-residentiel | 32 |
| 8121 | Élevage de bovins de boucherie | non-residentiel | 17 |
| 8122 | Élevage de bovins laitiers | non-residentiel | 66 |
| 8123 | Élevage de porcs | non-residentiel | 6 |
| 8124 | Élevage d'ovins | non-residentiel | 4 |
| 8125 | Élevage de volailles et production d'œufs | non-residentiel | 18 |
| 8126 | Élevage d'équidés | non-residentiel | 43 |
| 8127 | Élevage caprin | non-residentiel | 2 |
| 8128 | Apiculture | non-residentiel | 5 |
| 8129 | Autres types de production animale | non-residentiel | 49 |
| 8131 | Acériculture | non-residentiel | 80 |
| 8132 | Culture de céréales, de plantes oléagineuses et de légumineuses | non-residentiel | 133 |
| 8133 | Culture de légumes | non-residentiel | 182 |
| 8134 | Culture de fruits ou de noix | non-residentiel | 12 |
| 8135 | Horticulture ornementale | non-residentiel | 83 |
| 8136 | Production d'arbres de Noël | non-residentiel | 1 |
| 8137 | Production de cannabis | non-residentiel | 10 |
| 8139 | Autres types de production végétale | non-residentiel | 60 |
| 8191 | Terrain de pâture et de pacage | non-residentiel | 6 |
| 8192 | Ferme expérimentale | non-residentiel | 15 |
| 8199 | Autres activités agricoles | non-residentiel | 1465 |
| 8221 | Service de vétérinaires et d'hôpital pour les animaux de ferme | non-residentiel | 2 |
| 8229 | Autres services d’élevage d’animaux de ferme | non-residentiel | 1 |
| 8291 | Service d’horticulture | non-residentiel | 18 |
| 8299 | Autres activités reliées à l’agriculture | non-residentiel | 3 |
| 8311 | Exploitation forestière | non-residentiel | 247 |
| 8312 | Pépinière forestière | non-residentiel | 1 |
| 8319 | Autres productions ou récolte de produits forestiers | non-residentiel | 8 |
| 8321 | Production de tourbe | non-residentiel | 8 |
| 8332 |  | non-residentiel | 1 |
| 8399 | Autres services reliés à la foresterie | non-residentiel | 81 |
| 8421 | Pisciculture | non-residentiel | 3 |
| 8541 | Pierre de taille | non-residentiel | 1 |
| 8542 | Extraction de la pierre pour le concassage et l’enrochement | non-residentiel | 18 |
| 8543 | Extraction du sable et du gravier | non-residentiel | 32 |
| 8559 | Autres services professionnels miniers | non-residentiel | 2 |
| 9100 | Espace de terrain non aménagé et non exploité (excluant l’exploitation non commerciale de la forêt) | terrain | 44887 |
| 9211 | Réserve forestière | terrain | 28 |
| 9212 | Réserve pour la protection de la faune | terrain | 58 |
| 9220 | Forêt inexploitée qui n’est pas une réserve | terrain | 1575 |
| 9310 | Rivière et ruisseau | autre | 99 |
| 9320 | Lac | autre | 21 |
| 9330 | Baie | autre | 1 |
| 9390 | Autres étendues d’eau | autre | 32 |
| 9410 | Logement vacant dans un bâtiment comportant plusieurs logements ou autres locaux | autre | 19 |
| 9420 | Espace de plancher inoccupé dont l’usage serait industriel | non-residentiel | 11 |
| 9440 | Espace de plancher inoccupé dont l’usage serait pour services publics | non-residentiel | 7 |
| 9451 | Espace de plancher inoccupé dont l’usage serait la vente au détail | non-residentiel | 10 |
| 9452 | Espace de plancher inoccupé dont l’usage serait pour des fins de réparation (atelier) | non-residentiel | 4 |
| 9458 | Espace de plancher inoccupé dont l’usage serait pour de la restauration | non-residentiel | 6 |
| 9459 | Autres espaces de plancher inoccupés dont l’usage serait commercial | non-residentiel | 35 |
| 9460 | Espace de plancher inoccupé dont l’usage serait pour des fins de services professionnels | non-residentiel | 19 |
| 9470 | Espace de plancher inoccupé dont l’usage serait pour des fins culturelles | non-residentiel | 2 |
| 9480 | Espace de plancher inoccupé dont l’usage serait pour des fins d’extraction de richesses naturelles | non-residentiel | 3 |
| 9490 | Autres espaces de plancher inoccupé | non-residentiel | 194 |
| 9510 | Immeuble résidentiel en construction | autre | 247 |
| 9520 | Immeuble non résidentiel en construction | non-residentiel | 25 |
| 9530 | Bâtiment incendié et inutilisable | autre | 315 |
| 9900 | Autres espaces de terrain et étendues d’eau inexploités | terrain | 1088 |

</details>

---

## 5. Registre foncier — file structure as discovered

`package_show` returns six CSVs and one XLSX. The four count files were ingested:

| kind | resource file | columns (exact) | source rows |
|---|---|---|---|
| `ventes` | `donn_prix_vente_reqst.csv` | `DT_DEBUT_MOIS, ID_REGN_ADMIN, CD_PLAGE_PRIX, CD_NATR_ACTE_JURDQ, NB_REQST` | 3 262 |
| `transferts` | `donn_transf_prop_reqst.csv` | `DT_DEBUT_MOIS, ID_REGN_ADMIN, CD_NATR_ACTE_JURDQ, NB_REQST` | 10 736 |
| `hypotheques` | `donn_hypoth_reqst.csv` | `DT_DEBUT_MOIS, ID_REGN_ADMIN, CD_NATR_ACTE_JURDQ, NB_REQST` | 1 088 |
| `difficultes` | `donn_diff_fin_reqst.csv` | `DT_DEBUT_MOIS, ID_REGN_ADMIN, CD_CATGR_NATR, CD_NATR_ACTE_JURDQ, NB_REQST` | 4 821 |

Exact resource URLs (from `package_show`):

- `donn_prix_vente_reqst.csv` — `…/resource/c05ac154-4745-46d0-a158-e84655f66084/download/donn_prix_vente_reqst.csv`
- `donn_transf_prop_reqst.csv` — `…/resource/7b8e1f0b-8715-491a-a398-685ecae6438d/download/donn_transf_prop_reqst.csv`
- `donn_hypoth_reqst.csv` — `…/resource/739ac2bb-e549-4bcd-893d-768e37a03af6/download/donn_hypoth_reqst.csv`
- `donn_diff_fin_reqst.csv` — `…/resource/84ed216a-3284-4d05-aa85-d2ef30dd5d0f/download/donn_diff_fin_reqst.csv`
- workbook (price-band dictionary) — `…/resource/65e129ce-8685-4809-979b-e63f889bf316/download/stats_rf_marche-imm_qc_v2.0_2026_08_aout.xlsm`

(`…` = `https://www.donneesquebec.ca/recherche/dataset/93ce9cb5-0811-48e5-885e-98dce192d293`.)

Transformations:

- `period` = first 7 characters of `DT_DEBUT_MOIS` (the source is monthly: 2021-01 →
  2026-08, 68 periods).
- `region_code` = `ID_REGN_ADMIN`, zero-padded to two digits (`01`…`17`). The source has
  16 regions; **Nord-du-Québec (`10`) has no rows**.
- The source splits each count by nature of act (`CD_NATR_ACTE_JURDQ`). The normalized
  table has no nature column, so counts are **summed by (period, region, price band)**.
  This preserves the per-region/kind total exactly (validation 5: 3 947 127 = 3 947 127
  over 64 (kind, region) pairs).
- `price_band` is the publisher's own label, read from the workbook's `Codes` sheet block
  `Code prix` / `Nom prix` (`CD_PLAGE_PRIX` is only a numeric code). Labels, NBSP
  normalised to a plain space: `Moins de 250 000$`, `De 250 000$ à 500 000$`,
  `Plus de 500 000$`. Empty for the three kinds that are plain counts.
- `municipality_code` is empty: the source is regional, never municipal.
- 19 907 source rows → 6 526 normalized rows (`ventes` 3 262, `transferts` 1 088,
  `hypotheques` 1 088, `difficultes` 1 088).

---

## 6. Territories (`territories.csv`, 1 386 rows)

| level | rows | source |
|---|---|---|
| `region` | 17 | `regadm` labels in `MUN.csv` (`"Estrie (05)"`) |
| `mrc` | 88 | `MRC_CM_Arg.csv`, code = `mrccod[2:5]` (`AR020` → `020`); population `mrcpopul` |
| `municipalite` | 1 281 | every row of `MUN.csv`; code = `mcode`; population `mpopul` |

- **No `province` row.** The MAMH repertoire exposes only 2-digit region codes, 3-digit
  MRC codes and 5-digit municipal codes; there is no province-level code in these sources,
  and inventing one would violate the contract's "never invent a number" rule.
- The two `CM…` rows of `MRC_CM_Arg.csv` (Communauté métropolitaine de Québec/Montréal)
  are not MRCs and are excluded.
- `MUN.csv` also contains 184 entries without a roll file (105 territoires non organisés,
  30 réserves indiennes, native-lands and villages nordiques). They are emitted at
  `level=municipalite` because the contract's enum has no finer value; their `mrc` field
  (when present) gives the parent, otherwise the region. Conversely, 37 roll-index codes
  (`NR…`, `93xxx`) have no repertoire row; they only matter for a province-wide run.
- `parent_code`: MRC code when the municipality belongs to an MRC, otherwise its region
  code (Montréal, Laval, Québec, Sherbrooke, Trois-Rivières, Gatineau, Brossard, Longueuil).
- `population` is the source's estimate; empty for regions (no regional figure in these
  files) and never `0`.
- Slug rule: accent-stripped lowercase, dashes. All 1 281 municipalities are slugged first
  (they are the public pages), then MRCs, then regions; a collision gets `-<code_geo>`.
  Examples: city `montreal`, region `montreal-06`, city `laval`, region `laval-13`, city
  `quebec`.

---

## 7. Coordinates

Source: the MAMH 2026 GeoPackage supplied with the project (§1), layer
`rol_unite_p_2026` — **3 747 008 MULTIPOINT features**, `EPSG:4269` (NAD83), stored as
`x=longitude, y=latitude`. The attribute `mat18` matches the roll's matricule.

No GDAL/pyproj is installed, so the pipeline reads the GeoPackage as the SQLite file it is
(`sqlite3`, read-only) and parses the `GeoPackageBinary` header plus the WKB MULTIPOINT with
`struct`/stdlib. Coordinates are written with 6 decimals, `lat = y`, `lon = x`.

- Coverage: **515 945 / 515 945** emitted rows (100 %) have a point; the per-city counts
  equal the emitted counts in §2.
- No reprojection is applied: the values are NAD83 (EPSG:4269). Do not relabel them WGS84
  without a datum shift in the app.
- No geocoding, no interpolation, no fallback position: a unit with no point gets two empty
  strings.

---

## 8. Validation results

`pipeline/run.py` runs the eight checks of DATA-CONTRACT §5 inline, writes them to
`data/reports/ingest-report.json` and exits non-zero if any fails.
`pipeline/validate.py` re-runs them independently from the written files
(`data/reports/validation-report.json`).

Final full-scope run (10 municipalities, 2026-10-26):

| # | Check | Result |
|---|---|---|
| 1 | every municipality ≥ 100 units | **PASS** — 29 857 (min) to 60 000 (max) kept |
| 2 | 5 units per municipality re-read from the XML, field by field | **PASS** — 50 units × 23 fields, 0 mismatches |
| 3 | `value_total_cents ≥ value_land_cents` | **PASS** — 506 987 / 506 987 (100.000 %), 0 exceptions |
| 4 | no negative values, no missing required value, `roll_year` constant per municipality | **PASS** — 515 945 rows, 0 / 0 / 0 |
| 5 | `market_stats` sums equal source totals | **PASS** — 3 947 127 = 3 947 127, 64 pairs |
| 6 | manifest lists every source and artifact sha256 | **PASS** — 22 sources, 4 artifacts |
| 7 | `mat18` unique within each municipality | **PASS** — 0 duplicates (515 945 rows) |
| 8 | non-empty coordinates inside Québec bbox (45–63°N, −80/−57°W) | **PASS** — 515 945 / 515 945 |

The re-read in check 2 uses a second, independent extraction path
(`Element.find` on the XML, not the production parser) and compares all 23 XML-derived
columns; the comparison is embedded in the report.

**Deliberate-break demonstration** (reverted):

```text
$ # one row changed: lat=99.000000, value_land_cents=-5
$ python3 pipeline/validate.py ; echo $?
[validate] total=18 | pass=15 | fail=3
  FAIL  4. no negative values, ...   negatives: 23027-258968770010000000:value_land_cents=-5
  FAIL  8. coordinates inside Québec bbox ... outside bbox=1
  FAIL  6. manifest ... normalized/property_units.csv sha256 mismatch
[validate] FAIL (3 check(s))
1

$ cp /tmp/property_units.bak data/normalized/property_units.csv
$ python3 pipeline/validate.py ; echo $?
[validate] total=18 | pass=18 | fail=0
[validate] OK
0
```

The restored file's sha256 (`480fce56…fcd14`) equals the manifest entry again.

---

## 9. Known gaps and limitations

- **Truncated sample** (see §2): 515 945 / 1 165 682 units; capped cities only contain
  residential types, and the sample is spatially biased by `mat18` (Montréal: a 0.026°-wide
  longitudinal strip, not the island). This is the single most important limitation for the
  valuation model and should be fixed by amending the cap rule if city-wide coverage is
  required.
- **Plex/condo are field-derived, not CUBF codes**: `RL0104F` marks divided co-ownership
  (tenure unknown); `RL0311A ≥ 2` marks a multi-dwelling unit. A mixed building whose
  dwellings are rented or owned indifferently cannot be separated by this data.
- **14 retired CUBF codes** (20 units) have no label in the 2025 list; their type still
  follows their CUBF group, `cubf_label` is empty. Every other code maps as documented.
- **Market stats are regional only** (no municipality), nature-of-act is summed, and
  Nord-du-Québec (region 10) is absent from the source. Counts are not prices.
- **No province territory row** (no province code in the sources — see §6).
- **Territory coverage vs roll**: 1 281 repertoire entries vs 1 134 roll files; 184
  repertoire entries have no roll, 37 roll codes have no repertoire row.
- **Roll years vary** (2024 Gatineau; 2025 six cities; 2026 three cities): `RLM02A` is the
  millésime, the file year is 2026.
- **Address** keeps only the lower civic number, street name and suite (contract columns);
  the generic road code (`CH`, `RUE`…) is not stored. `addr_street_norm` is the only
  matching key shared with the MERN geocoder.
- **Source zeros**: `0` for a measure/year is written empty (treated as not applicable);
  `0` for a dollar value is kept (a real assessed value). This rule is documented in §3.3.
- **`--all-municipalities`** will trip check 1 for municipalities with fewer than 100 units
  (the contract's literal check). Pass `--min-units-per-municipality 1` for a province run.

---

## 10. Reproduce

```bash
# 1. v1 (10 municipalities, default 60 000 cap) — ~2 min on this machine
python3 pipeline/run.py

# 2. the contract's acceptance command (exit 0, every artifact written)
python3 pipeline/run.py --municipalities 66023,65005 --max-units 2000

# 3. determinism: two runs produce byte-identical CSVs
python3 pipeline/run.py --municipalities 66023 --max-units 2000
shasum -a 256 data/normalized/*.csv

# 4. independent validation (exit non-zero on any broken check)
python3 pipeline/validate.py

# 5. whole province (slow: 1 134 files, ~1.8 GB+; check 1 needs the relaxed minimum)
python3 pipeline/run.py --all-municipalities --max-units 60000 --min-units-per-municipality 1
```

Caches live in `data/raw/` (`--force` re-downloads). The GeoPackage is extracted from
`--geopackage-zip` (default `~/Downloads/ROLE2026_GEOPACKAGE.zip`) into
`data/raw/geo/Role_2026_2.gpkg` on first use; `--skip-geo` builds without coordinates
(and the coordinate check then has nothing to verify).
