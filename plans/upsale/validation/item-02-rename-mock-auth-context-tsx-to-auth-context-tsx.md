---
item_index: 2
item_slug: rename-mock-auth-context-tsx-to-auth-context-tsx
track: technical
decision: KEEP
---

# Audits

- **Clause:** `lib/auth/mock-auth-context.tsx` is imported by 6 production files under its "mock" name
  - **Evidence:** `item_evidence` cites `03-architecture-shape.md:47` — "Cross-module hot-spot — `lib/auth/mock-auth-context.tsx`: imported by 6 files". Confirmed by repo grep across `app/`, `components/`, `lib/`: 6 import sites found — `app/[locale]/layout.tsx`, `components/header/account-menu.tsx`, `components/login/login-form.tsx`, `components/kudos/kudos-board-context.tsx`, `lib/auth/auth-guard.tsx`, `components/header/notification-bell.tsx`.
  - **Verdict:** correct
- **Clause:** 6 import sites: `login-form.tsx`, `notification-bell.tsx`, `auth-guard.tsx`, `account-menu.tsx`, `kudos-board-context.tsx`, `app/[locale]/layout.tsx` (`03-architecture-shape.md:47`)
  - **Evidence:** `03-architecture-shape.md:47` lists exactly these six files. Repo grep confirms each: `login-form.tsx`, `notification-bell.tsx`, `auth-guard.tsx`, `account-menu.tsx`, `kudos-board-context.tsx`, `app/[locale]/layout.tsx` all import from `@/lib/auth/mock-auth-context`.
  - **Verdict:** correct
- **Clause:** no Supabase Auth wired (`03-architecture-shape.md:27`)
  - **Evidence:** `item_evidence` cites `03-architecture-shape.md:27` — "no Supabase Auth wired". Corroborated by `03-architecture-shape.md:57` — "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only); Supabase Auth session is NOT connected". File `lib/auth/mock-auth-context.tsx` confirmed present at that path.
  - **Verdict:** correct

# Reason

Check 1 (holistic) KEEP — all three Need claims resolve correctly against `item_evidence` and the live repo; the file exists at the cited path, 6 import sites confirmed exactly, and the "no Supabase Auth wired" assertion is directly corroborated. Check 2: `medium` value is defensible — a named code-quality signal (misleading "mock" label in production import graph) with a named roadmap dependency (swap point for future auth). Check 3: internal use-context — item is a code-quality rename, not monetization-linked; no filter triggered. Check 4: Benefits are concrete (decouples 6 consumers from prototype label; removes reviewer blind-spot risk). Check 5: no invented citations or secrets. Check 6: formatting intact. NOTE — item-19 (Supabase Auth wiring) subsumes this file by replacing `MockAuthProvider` entirely; however, item-02 delivers independent interim value: clarifies intent before item-19 lands, reduces reviewer under-scrutiny risk during the gap period, and is a zero-behavior-change low-effort step. Not redundant enough to DROP or REVISE.
