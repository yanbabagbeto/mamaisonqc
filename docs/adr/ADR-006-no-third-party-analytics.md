# ADR-006: First-party, consent-gated analytics; no ad pixels
Status: accepted (2026-10-26) | Deciders: lead
Context: The reference product ships Meta/GA pixels and reads them before consent; Québec's Loi 25 raises
the cost of that pattern, and the product's differentiator is trust.
Decision: No third-party analytics or ad pixels in v1. A first-party `page_view`/`consent_event` table
records anonymous events only after an explicit consent choice; refusal logs nothing but the refusal.
Alternatives considered: GA4 + Meta pixel as-is (rejected: Loi 25 exposure, contradicts positioning);
Plausible/Umami hosted (rejected: external dep, unnecessary for v1).
Consequences: positive privacy-by-default, no cookie banner maze beyond one honest choice; negative weaker
acquisition attribution. Debt: server-side event export deferred.
Revisit if: paid acquisition needs attribution — then use a consent-mode-gated vendor, not pixels.
