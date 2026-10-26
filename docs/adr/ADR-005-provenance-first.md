# ADR-005: Provenance is a data column, not a footer
Status: accepted (2026-10-26) | Deciders: lead
Context: Every figure derives from CC-BY 4.0 government datasets; mislabelled or unattributed numbers are
both a licence breach and a trust failure (PRD AC-8, AC-18).
Decision: `dataset` + `dataset_license` + `fetched_at` + `source_url` are stored per ingested dataset and
joined into every rendered figure; a `<Provenance>` component is mandatory for any numeric block, and a
unit test asserts each number component receives a provenance prop.
Alternatives considered: global footer attribution only (rejected: cannot prove per-figure accuracy);
free-text captions (rejected: unverifiable, drifts).
Consequences: positive defensible numbers, easy audit page (`/donnees`); negative small join cost and more
props. Debt: none.
Revisit if: a non-government data vendor is added (needs its own licence model).
