# Data contract — normalized artifacts

The Python ETL in `pipeline/` produces the files below. `npm run db:build` loads them into
`data/mamaisonqc.db` through `src/db/seed.ts`. Nothing else may write those files.

## 1. Sources (verified 2026-10-26 — re-verify URLs before use)

| id | Dataset | Publisher | Licence | URL |
|---|---|---|---|---|
| `role-evaluation-<year>` | Rôle d'évaluation foncière du Québec (1,140 XML files, one per municipality) | MAMH / Affaires municipales | CC-BY 4.0 | index: `https://donneesouvertes.affmunqc.net/role/indexRole<year>.csv` — each row has `lien` → `RL<code>_<year>.xml` |
| `registre-foncier-stats` | Statistiques du Registre foncier sur le marché immobilier (CSV by kind + XLSX) | Registre foncier du Québec | CC-BY 4.0 | `https://www.donneesquebec.ca/recherche/api/3/action/package_show?id=statistiques-du-registre-foncier-du-quebec-sur-le-marche-immobilier` |
| `mamh-municipalites` | Répertoire des municipalités (code géographique, MRC, région administrative) | MAMH | CC-BY 4.0 | discover via Données Québec `package_search`, record the exact URL used |
| `cubf` | Liste des codes d'utilisation des biens-fonds | MAMH | open government licence | record the exact URL used |
| geocoder (runtime, not ingested) | Adresses Québec REST | MERN | CC-BY 4.0 | `https://servicescarto.mrnf.gouv.qc.ca/pes/rest/services/Territoire/Adresse_Geocodage/GeocodeServer` |

Rules: never invent a URL, a licence, a field or a number. If a source is unreachable, stop and record
it in `data/reports/ingest-report.json` — do not substitute placeholder data.

## 2. Field mapping — rôle d'évaluation

From the official MAMH guide *Guide sur les données du rôle d'évaluation foncière en format ouvert*
(field definitions verified in the PDF, section pages 9–23):

| XML tag | Meaning (official) | Column |
|---|---|---|
| `RLM01A` | code géographique de la municipalité | `municipality_code` |
| `RLM02A` | année du rôle | `roll_year` |
| `RL0101Ax` | numéro inférieur (civic) | `addr_no` |
| `RL0101Gx` | nom de la voie publique | `addr_street` ( + `addr_street_norm`) |
| `RL0101Ix` | numéro d'appartement / local | `addr_suite` |
| `RL0103Ax` | matricule (identifiant de l'unité d'évaluation) | `matricule` |
| `RL0105A` | utilisation prédominante (code CUBF) | `cubf` → `property_type` via the CUBF list |
| `RL0107A` | numéro d'unité de voisinage (UMV) | `umv` |
| `RL0301A` | mesure frontale du terrain (m) | `frontage_m` |
| `RL0302A` | superficie du terrain (m²) | `land_area_m2` |
| `RL0306A` | nombre d'étages | `floors` |
| `RL0307A` | année de construction | `year_built` |
| `RL0401A` | date de référence du marché | `market_ref_date` |
| `RL0402A` | valeur du terrain ($) | `value_land_cents` (×100) |
| `RL0403A` | valeur du bâtiment ($) | `value_building_cents` (×100) |
| `RL0404A` | **valeur de l'immeuble** ($, terrain + bâtiments) | `value_total_cents` (×100) |
| `RL0405A` | valeur de l'immeuble au rôle antérieur ($) | `value_prior_cents` (×100) |

`source_url` = the exact XML URL used. Do not store anything not listed here.

## 3. Output files (all UTF-8, comma-separated, header row, `\n` endings)

`data/normalized/territories.csv`
```
code_geo,name,level,parent_code,slug,population
```
`level` ∈ `province|region|mrc|municipalite`; `slug` = lowercase ASCII, dashes, unique
(accent-stripped name, `-` separators); `population` empty when unknown (never 0 as a placeholder).

`data/normalized/property_units.csv`
```
id,municipality_code,matricule,umv,cubf,cubf_label,property_type,addr_no,addr_street,addr_street_norm,addr_suite,land_area_m2,frontage_m,year_built,floors,value_land_cents,value_building_cents,value_total_cents,value_prior_cents,market_ref_date,roll_year,source_url,dataset_id
```
- `id` = `<municipality_code>-<matricule>`.
- `property_type` ∈ `unifamiliale|copropriete|plex|terrain|non-residentiel|autre`. The mapping from CUBF
  codes must be written to `docs/DATA.md`; unmapped codes go to `autre` (never guess a type).
- `addr_street_norm`: lowercase, accents removed, punctuation collapsed to single spaces, trimmed.
- Empty string for unknown values (never `0`, `null`, `N/A`, or a mean).

`data/normalized/market_stats.csv`
```
id,period,region_code,municipality_code,kind,price_band,count,dataset_id
```
- `kind` ∈ `ventes|transferts|hypotheques|difficultes`.
- `period` = `YYYY-MM` (source granularity; if the source is monthly, keep monthly).
- `price_band` = the source's own band label, verbatim (e.g. `300000-349999`), empty when the source is a
  plain count. Never compute an average price and present it as official.

`data/normalized/datasets.json`
```json
[{ "id": "...", "name": "...", "publisher": "...", "license": "...", "licenseUrl": "...",
   "sourceUrl": "...", "fetchedAt": "...", "referenceDate": "...", "rowCount": 0,
   "checksum": "sha256:...", "notes": "..." }]
```

`data/reports/ingest-report.json`
```json
{ "generatedAt": "...", "sources": [{ "id": "...", "url": "...", "status": "ok|failed",
  "bytes": 0, "durationMs": 0, "error": null }],
  "scope": { "municipalities": [...] },
  "counts": { "territories": 0, "propertyUnits": 0, "marketStats": 0 },
  "validation": [{ "check": "...", "status": "pass|fail", "detail": "..." }] }
```

## 4. Scope for v1

Ingest the 2026 roll for this municipality set (code géographique):
`66023` Montréal, `65005` Laval, `58227` Longueuil, `23027` Québec, `81017` Gatineau,
`43027` Sherbrooke, `37067` Trois-Rivières, `58007` Brossard, `64008` Terrebonne, `75017` Saint-Jérôme.

Cap: keep at most 60,000 units per municipality (deterministic sample: keep residential/condo/plex types
first, then the rest by ascending matricule) so the SQLite file stays under ~150 MB. Record the cap in
the report. The pipeline must accept `--municipalities` and `--max-units` flags so the full province is a
flag away.

## 5. Validation the pipeline must prove (non-negotiable)

1. Every municipality in scope produced ≥ 100 units (else the report marks `fail`).
2. For each municipality, 5 random units are re-read from the source XML and compared field by field;
   any mismatch fails the build (write the comparison into the report).
3. `value_total_cents` ≥ `value_land_cents` for ≥ 99 % of units (allow the legitimate exceptions and
   explain them in the report).
4. No negative values, no null in required columns, `roll_year` consistent per municipality.
5. Sum of `market_stats.count` per region/kind matches the source total (±0).
6. `data/manifest.json` records every source URL, fetch time and sha256 of each artifact.

## 6. What the pipeline must NOT do

- No scraping of Centris, OpenHouseQC, or any MLS/broker site.
- No APCIQ press-release numbers typed by hand.
- No synthetic/np.random/sample property records. Real rows only.
- No committed artifacts: `data/normalized/`, `data/reports/`, `data/*.db` are git-ignored.
