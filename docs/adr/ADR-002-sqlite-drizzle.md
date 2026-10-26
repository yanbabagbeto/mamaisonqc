# ADR-002: SQLite (better-sqlite3) + Drizzle as the single datastore
Status: accepted (2026-10-26) | Deciders: lead
Context: No Postgres/Docker on the target machine (verified: `command -v psql` empty, no docker).
Data is read-heavy, public, built offline by a Python ETL; user-generated volume is tiny.
Decision: SQLite file `data/mamaisonqc.db`, schema in `src/db/schema.ts` (Drizzle, sqlite-core),
queries through repositories so the adapter can be swapped.
Alternatives considered: Postgres (rejected for v1: not installed, adds ops for zero current need);
Supabase (rejected: external account + keys unavailable, and the PRD forbids inventing credentials);
node:sqlite builtin (viable — verified working — rejected only because Drizzle's better-sqlite3 adapter
is the documented path); better-sqlite3 verified installing and running on Node 26/arm64 here.
Consequences: positive zero-ops, single file, fast reads, easy backup; negative single-writer, no managed
concurrency, no serverless ephemeral FS. Debt: Postgres migration path documented (ARCHITECTURE §6 rung 3).
Revisit if: concurrent writes matter, or deploy target lacks persistent disk.
