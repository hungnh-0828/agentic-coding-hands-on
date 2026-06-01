---
item_index: 4
item_slug: add-unit-tests-for-mock-auth-context
track: technical
decision: keep
---

# Audits

- **Clause:** `lib/auth/mock-auth-context.tsx` is the sole auth layer driving all UI auth state
  - **Evidence:** `item_evidence` (third block): "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only)" (`03-architecture-shape.md`). Confirmed by repo: file exists at `lib/auth/mock-auth-context.tsx` (46 LOC, exports `MockAuthProvider` and `useMockAuth`). No other auth context file found under `lib/auth/`.
  - **Verdict:** correct
- **Clause:** `lib/auth/mock-auth-context.tsx` is imported by 6 files
  - **Evidence:** `item_evidence`: "imported by 6 files (`login-form.tsx`, `notification-bell.tsx`, `auth-guard.tsx`, `account-menu.tsx`, `kudos-board-context.tsx`, `app/[locale]/layout.tsx`)" (`03-architecture-shape.md`). Repo grep confirms exactly 6 import sites: `components/login/login-form.tsx:8`, `components/header/notification-bell.tsx:6`, `lib/auth/auth-guard.tsx:7`, `components/header/account-menu.tsx:7`, `components/kudos/kudos-board-context.tsx:12`, `app/[locale]/layout.tsx:8`.
  - **Verdict:** correct
- **Clause:** `ls lib/auth/__tests__/` returns empty — no test file exists
  - **Evidence:** `item_evidence`: "`ls lib/auth/__tests__/` returns empty (confirmed at runtime)". Repo confirms: `lib/auth/__tests__/` directory does not exist (`ls lib/auth/` returns only `auth-guard.tsx` and `mock-auth-context.tsx`).
  - **Verdict:** correct

# Reason

Check 1 (holistic) — all Need claims are evidenced and correct; the proposed solution (jsdom-scoped vitest file covering three scenarios) is implementable in the detected stack (vitest 2.x, React 19, per-file `@vitest-environment jsdom`). The adversarial concern — that item-19 replaces MockAuthProvider — does not override KEEP: (a) item-19 is a separate high-effort proposal with no guaranteed order of execution; (b) the mock is live in production across 6 consumers NOW; (c) tests written against the mock's behavioral contract serve as a regression net precisely during the real-auth migration, not wasted afterward; (d) "low" effort means the cost of potential waste is minimal. Benefits are concrete (auth-guard redirects, notification bell failures, login state) and tied to named consumers. Value "medium" is defensible for a risk-reduction item on a 6-consumer auth provider. Use-context "internal" is consistent (operational safety, not monetization). No fabricated citations, no secrets. Checks 2–6 all pass.

