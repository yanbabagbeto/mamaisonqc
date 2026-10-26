# ADR-004: Offline Python ETL → versioned SQLite artifact
Status: accepted (2026-10-26) | Deciders: lead
Context: Sources are 12 MB XML per small municipality (province ≈ 10+ GB), CSVs, and a REST geocoder.
Ingest must be re-runnable, inspectable and must not run at request time.
Decision: `pipeline/` (Python 3, lxml/pandas/httpx) downloads, validates, normalizes to `data/normalized/`
(CSV/JSONL + `provenance.json`), then `scripts/seed.ts` loads it into SQLite via Drizzle. Artifacts are
git-ignored; `data/manifest.json` records source URLs, licence, fetch date, row counts and checksums.
Alternatives considered: ingest in Node at request time (rejected: slow, brittle, blocks requests); commit
the .db to git (rejected: opaque binary, poor diffs); live query the MERN WMS/geocoder for property data
(rejected: geocoder returns addresses, not roll values).
Consequences: positive reproducibility + provenance by construction; negative a two-language repo and a
manual rebuild step. Debt: no scheduler — refresh is a documented command.
Revisit if: nightly refresh is needed, then wrap the pipeline in a scheduled job (ADR-004 stays valid).
