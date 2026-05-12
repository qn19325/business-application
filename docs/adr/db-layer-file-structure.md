---
type: decision
title: DB Layer File Structure — Flat Files Per Domain Entity
date: 2026-04-29
status: superseded
superseded-by: ./four-tier-layered-architecture.md
domain: product
tags: [architecture, drizzle, phase-b]
---

# DB Layer File Structure — Flat Files Per Domain Entity

## Decision

All database access for a given domain entity — both reads and writes — lives in a single flat file under `src/db/`, named after the entity.

```
src/db/
  schema.ts
  seed.ts
  clients.ts      ← reads + writes for the clients domain
  submissions.ts  ← reads + writes for the submissions domain (future)
```

`src/lib/` is reserved for pure domain logic that does not directly call the database (deadline calculations, status derivation, etc.).

## Context

Phase B's [[phase-b-code-review]] finding #33 called for extracting domain helpers from `ClientListItem.tsx` into a `src/lib/clients.ts` file. That raised the question of where DB mutations should live — currently `createClient` (the transaction logic) is inline in `src/app/clients/actions.ts`.

The refactor to `useActionState` (#23) made the separation concrete: `actions.ts` will become a thin React adapter (parse FormData, call domain function, return state), so the transaction logic needs a permanent home.

## Options Considered

### Option A — Reads in `src/db/queries/`, writes in `src/db/mutations/` (or similar)

Explicit separation of reads and writes at the file level.

**Pros:** Clear at a glance which files mutate state.
**Cons:** For a domain entity, you always end up looking in two places. The distinction maps to SQL (SELECT vs INSERT/UPDATE) rather than to domain concepts. Adds subdirectory overhead that isn't earned yet.

### Option B — Everything domain-related in `src/lib/`

`src/lib/clients.ts` holds both Drizzle calls and domain logic.

**Pros:** One file per domain entity regardless of DB vs logic.
**Cons:** `src/lib/` already exists as a logic-only layer (`deadlines.ts`). Mixing Drizzle calls into it blurs the boundary. Components importing from `lib/` would transitively pull in DB dependencies.

### Option C — Flat files per entity in `src/db/` (chosen)

Reads and writes together, one file per domain entity, no subdirectories.

**Pros:** Consistent with how `src/db/` already reads — it's the database layer, full stop. `src/lib/` stays clean as logic-only. One file to open when working on a domain entity's data access. Scales naturally: new entities add a new flat file.
**Cons:** The existing folder is named `queries/` (reads-only implication). Needs renaming.

## Rationale

The split between Option A and C comes down to whether the meaningful boundary is **read vs write** or **DB access vs domain logic**. Given that reads and writes for the same entity share schema imports, types, and query patterns, splitting them by SQL verb adds friction without adding clarity.

Option B was ruled out because `src/lib/` is already established as the layer for logic that doesn't touch the DB. Blurring that with Drizzle calls would make the dependency graph harder to reason about over time.

## Migration from Current State

`src/db/queries/clients.ts` → `src/db/clients.ts`. The `queries/` directory is removed; future entities go flat under `src/db/`.

## What This Gates

- New domain entities get a `src/db/<entity>.ts` file for all Drizzle access.
- `src/lib/` files must not import from Drizzle directly — if they need data, they call a function from `src/db/`.
- `src/app/**/actions.ts` files are React/Next.js adapters only — they call `src/db/` or `src/lib/`, never Drizzle directly.
