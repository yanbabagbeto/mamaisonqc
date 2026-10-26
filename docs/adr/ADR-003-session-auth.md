# ADR-003: Owned opaque-session auth instead of an auth vendor
Status: accepted (2026-10-26) | Deciders: lead
Context: Only two credential flows exist (claim an owner page, admin). No SSO, no social login, no
organization model. No third-party account/keys are available in this environment.
Decision: Email + bcryptjs(12) password, opaque 32-byte session token hashed (SHA-256) at rest, HttpOnly
SameSite=Lax cookie, 30-day rolling expiry, server-side revocation.
Alternatives considered: Auth.js/NextAuth (rejected: adds an abstraction and a config surface for one
credential flow); Clerk (rejected: external dependency + keys we do not have); JWT in localStorage
(rejected: XSS exposure, no revocation).
Consequences: positive small auditable surface, immediate revocation, no vendor; negative we own password
reset (v1: admin-assisted), no MFA. Debt: reset flow deferred to v2.
Revisit if: social login, MFA, or B2B tenancy is required.
