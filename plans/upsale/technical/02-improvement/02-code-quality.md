# Improvement Aspect: Code Quality — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: code-quality
- Observation: `lib/kudos/actions.ts:23` hardcodes `SENDER_ID = "00000000-0000-0000-0000-000000000001"` as a named constant rather than resolving the authenticated user — the identifier communicates unfinished work and the TODO is unresolved in production code.
- Evidence: discovery `03-architecture-shape.md:57` — "lib/kudos/actions.ts:23 hardcodes SENDER_ID"; `05-scale-complexity.md:20` — 4 TODO/FIXME markers across ~6k LOC (~0.7/1k), this being the most critical named instance.
- Potential improvement: Replace the constant with a call to the session-aware server Supabase client (`lib/supabase/server.ts`) to extract the real user ID. Remove the TODO comment once resolved. This is a one-file change; `createKudos` and `toggleKudosLike` both accept `userId` as parameter so the call-site fix is contained.
- Customer-value signal: operational efficiency | risk reduction
- Value: high
- Effort hint: low
- Risk if untouched: All kudos are attributed to one hardcoded user ID. When real auth is wired (the stated direction), every historical kudos record will carry the wrong author, requiring data backfill. The longer this ships as-is the higher the migration cost.

---

- Status: opportunity
- Category: code-quality
- Observation: The Next.js i18n middleware file is named `proxy.ts` instead of the framework-required `middleware.ts`, diverging from Next.js App Router convention and making the entry point non-discoverable.
- Evidence: discovery `03-architecture-shape.md:41` — "proxy.ts — next-intl middleware (locale prefix routing); NOTE: named proxy.ts, not middleware.ts"; `03-architecture-shape.md:51` — "i18n middleware: proxy.ts:1 (non-standard name — Next.js convention is middleware.ts)".
- Potential improvement: Rename `proxy.ts` → `middleware.ts` (one-line git mv). Verify `next.config.ts` has no explicit `matcher` override pointing to the old name. This is a zero-logic change with immediate DX improvement and eliminates a likely gotcha for any new contributor or upgrade tool that looks for `middleware.ts`.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: medium
- Effort hint: low
- Risk if untouched: Future contributors and automated migration tooling (e.g., Next.js codemods) will fail to locate or process the middleware file. Upgrade path friction compounds over time.

---

- Status: opportunity
- Category: code-quality
- Observation: `lib/auth/mock-auth-context.tsx` is imported by 6 production files under its "mock" name, embedding a prototype-quality label into the live codebase's import graph. The naming signals unresolved design intent rather than a deliberate stub.
- Evidence: discovery `03-architecture-shape.md:47` — "lib/auth/mock-auth-context.tsx: imported by 6 files (login-form.tsx, notification-bell.tsx, auth-guard.tsx, account-menu.tsx, kudos-board-context.tsx, app/[locale]/layout.tsx)"; `03-architecture-shape.md:27` — "no Supabase Auth wired".
- Potential improvement: Rename to `lib/auth/auth-context.tsx` with an interface that both the current mock provider and a future real Supabase Auth provider implement. This decouples the 6 consumers from the "mock" label and creates a clean swap point. No behavior change required now — naming and interface extraction only.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: medium
- Effort hint: low
- Risk if untouched: When real auth is implemented, 6 import sites must be renamed. More importantly, the "mock" label suppresses code-reviewer attention — changes to auth logic may be under-scrutinized because the file reads as temporary.

---

- Status: opportunity
- Category: code-quality
- Observation: `tsconfig.json` targets ES2017, while the runtime is Node 24 (current active LTS) and the deployment targets are Vercel (modern V8) and AWS ECS Fargate. ES2017 forces the TypeScript compiler to down-emit modern syntax, potentially masking type-level assumptions that rely on newer built-ins.
- Evidence: discovery `01-repository-identity.md:7` — "compile target ES2017 (tsconfig.json:3)"; `02-tech-stack.md:37` — "TypeScript compiler (tsc) — tsconfig.json (target: ES2017, strict: true, path alias @/* → ./)"; `02-tech-stack.md:52` — "Node.js: runtime environment reports v24.11.1 (current LTS)".
- Potential improvement: Raise `target` to `ES2022` (or `ES2023`) in `tsconfig.json`. Align `lib` accordingly. This is a tsconfig one-liner; Next.js controls its own Babel/SWC emit independently so there is no runtime regression risk from this change.
- Customer-value signal: operational efficiency | platform capability
- Value: low
- Effort hint: low
- Risk if untouched: Low short-term impact. Over time, ES2017 target can cause subtle polyfill bloat if native-only built-ins are used in TypeScript source. Primarily a hygiene and maintainability signal.

---

- Status: opportunity
- Category: code-quality
- Observation: `components/kudos/kudos-board-context.tsx` at 216 LOC is the largest non-test source file and has 11 inbound consumers — it concentrates state, derived data, and side-effects in one context module, making individual concerns hard to read or test in isolation.
- Evidence: discovery `03-architecture-shape.md:45` — "God file — components/kudos/kudos-board-context.tsx: 216 LOC, 11 inbound imports"; `05-scale-complexity.md:18` — "components/kudos/kudos-board-context.tsx — 216 LOC" (only non-test file exceeding 200 LOC).
- Potential improvement: Extract distinct concerns — e.g., filter state, compose modal open/close, toast queue — into narrower context slices or custom hooks (`useKudosFilters`, `useComposeModal`). Keep `kudos-board-context.tsx` as a thin orchestrator. This is a readability and testability refactor; no API contract changes required.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: low
- Effort hint: medium
- Risk if untouched: As the board grows (more filter types, compose features, notification variants), this file will accumulate further concerns. Re-render blast radius is already wide (11 consumers subscribe to one context). Incremental complexity will be disproportionately expensive to reason about.

---

- Status: clean — no current gap
- Category: code-quality
- Observation: TypeScript strict mode is enabled and the codebase holds only ~0.7 TODO/FIXME per 1k LOC across 70 source files — well below the 2–3/1k threshold that signals chronic debt accumulation.
- Evidence: discovery `02-tech-stack.md:37` — "strict: true"; `05-scale-complexity.md:20` — "4 markers across app/+components/+lib/ (~6k LOC) → ~0.7 per 1k LOC".
- Potential improvement: No action required. Maintain via ESLint `no-warning-comments` rule if the team grows.
- Customer-value signal: operational efficiency
- Value: low
- Effort hint: low
- Risk if untouched: No current risk.
