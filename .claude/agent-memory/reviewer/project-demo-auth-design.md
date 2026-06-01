---
name: project-demo-auth-design
description: This is a demo app with intentionally mock UI-only auth — calibrate review severity accordingly
metadata:
  type: project
---

This codebase is a DEMO app. Auth is intentionally MOCK and UI-only (client-side mock context); there is no real Supabase Auth session yet. These are DOCUMENTED deferrals, not defects — do NOT report them as Critical:

- Mock client-side auth / client-side `AuthGuard` (bypassable by design).
- `SENDER_ID` hardcoded in `lib/kudos/actions.ts`; `userId` taken from caller in `toggleKudosLike`.
- Permissive demo write RLS. Note: RLS **is** enabled on all kudos tables (migration 0004) — writes succeed by design via permissive policies, so do not claim writes are broken.
- Mocked prize-box counts in `fetchKudosStats`.

All carry explicit `TODO(auth)` markers. Focus reviews on genuine defects within the demo's own design: logic errors, races, broken invariants, data integrity, type-safety holes, DoS/payload amplification, resource leaks. See [[project-nextjs16-conventions]] for framework-behavior caveats.
