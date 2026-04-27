---
description: Review files changed since HEAD against project conventions
---

Review only the files changed in the working tree against the engineering conventions and architecture principles in `CLAUDE.md`.

Steps:

1. Run `git diff --name-only HEAD` to list changed files.
2. Read each changed file in full (not just the diff — context matters).
3. Check each file against:
   - TypeScript conventions (strict, no `any`, const-object enum pattern)
   - React / Next.js conventions (server components by default, push client to leaves, Server Actions for mutations)
   - Data / Drizzle conventions (queries in dedicated files, DB types mapped to domain types before UI)
   - Code organisation (group by feature, follow existing patterns)
   - Domain & Data Principles (two roles separated, `practice_id` everywhere, HMRC field naming)
4. Report findings grouped by file. Issues only — not observations. Each finding should state the problem and why it matters.
