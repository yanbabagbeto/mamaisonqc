# ADR-001: Next.js 15 App Router for the whole product
Status: accepted (2026-10-26) | Deciders: lead
Context: ~4,000 data-driven public pages must be crawlable and fast; the same app also hosts
authenticated owner/admin flows; one deliverable, no separate API team.
Decision: One Next.js 15 App Router application (React 19, TS strict), SSR/RSC for public pages,
route handlers + server actions for mutations.
Alternatives considered: Vite + React SPA (rejected: no per-page SEO, blank-first-paint for 4k pages);
Astro + islands (rejected: auth/dashboard/admin would need a second app and a second deploy);
SvelteKit (rejected: no team familiarity, no ecosystem gain here).
Consequences: positive SSR/SEO, one deploy, shared design tokens; negative RSC mental model, Vercel-flavoured
tooling if deployed there. Debt: none accepted.
Revisit if: public pages exceed ~50k and build time dominates, or a native app needs a shared API layer.
