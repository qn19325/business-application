---
description: Review all source code under src/ against project conventions
---

Review the entire codebase against the engineering conventions and architecture principles in `CLAUDE.md`.

Steps:

1. Run `npm run format:check`, `npm run lint`, and `npm run build` in parallel. Note any failures.
2. Read every file under `src/`.
3. Check each file against:
   - TypeScript conventions (strict, no `any`, const-object enum pattern)
   - React / Next.js conventions (server components by default, push client to leaves, Server Actions for mutations)
   - Data / Drizzle conventions (queries in dedicated files, DB types mapped to domain types before UI)
   - Code organisation (group by feature, follow existing patterns)
   - Domain & Data Principles (two roles separated, `practice_id` everywhere, HMRC field naming)
4. Report findings grouped by file. Issues only — not observations. Each finding should state the problem and why it matters.
