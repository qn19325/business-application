---
name: feedback_type_assertions
description: Avoid `as Type` casts — use type guards or narrowing instead
metadata:
  type: feedback
---

Don't use `as Type` casts to silence TypeScript. Use runtime narrowing (find, includes, type guard fns) instead.

**Why:** Casts bypass type safety — the whole point of TS strictness is lost.

**How to apply:** For union/const-object types, use `Object.values(X).find(...)` or an explicit guard. For impossible cases, return early rather than throw or cast.
