# ADR-007: Classic App Router cache model (Cache Components disabled for v1)
Status: accepted (2026-10-26) | Deciders: lead
Context: `create-next-app` scaffolds Next.js 16 with `cacheComponents: true` and
`partialPrefetching: true`. With Cache Components, every runtime read (cookies, headers, params,
searchParams) and every uncached async read must sit behind a `<Suspense>` boundary, and the dev
overlay/build validator flags non-compliant routes. This app is overwhelmingly dynamic, DB-driven
pages (valuation, market, dashboards) written by several agents in parallel.
Decision: set `cacheComponents: false` and `partialPrefetching: false`; use the classic App Router
model of this Next version (async server components, `dynamic`/`revalidate` segment config).
Alternatives considered: keep Cache Components and wrap every dynamic read in Suspense (rejected for
v1: ~40 routes × cross-agent consistency, high build-break risk, no user-visible gain at current
traffic); adopt Partial Prefetching only (rejected: requires Cache Components).
Consequences: positive predictable builds, familiar data-fetching, faster team throughput; negative
loses partial prefetching and the static-shell streaming optimisations, and will need a migration
when Cache Components become the only model. Debt: revisit at the static-generation rung
(ARCHITECTURE §6.4).
Revisit if: >5k monthly visits needing instant navigation, or Next.js removes the classic model.
