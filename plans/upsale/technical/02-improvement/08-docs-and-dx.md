# Improvement Aspect: Docs & DX — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: docs-and-dx
- Observation: No `.env.example` exists; the only environment file is `.env.local` (untracked). A new developer must reverse-engineer required env vars from source.
- Evidence: `06-security-compliance.md` — ".env.local present on disk (untracked): variable classes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_EVENT_DATETIME` (`.env.local:1-3`). Values never quoted." No `.env.example` mentioned anywhere in discovery.
- Potential improvement: Add `.env.example` with all three variable names and safe placeholder values; commit alongside a one-paragraph "Local setup" section in README that references it. No secrets exposed.
- Customer-value signal: employee productivity | time-to-market for dependent teams
- Value: medium
- Effort hint: low
- Risk if untouched: New contributors or rotated team members spend non-trivial time diagnosing missing-env errors on first run; onboarding friction compounds over the project's remaining active lifecycle.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: No Node.js version is pinned — no `.nvmrc`, no `engines` field in `package.json`. The runtime is inferred by the Next.js/React version range, not declared.
- Evidence: `01-repository-identity.md` — "no explicit version pin (no `.nvmrc`, no `engines` field in `package.json`)" (`package.json:7` has no `engines`). `02-tech-stack.md` — "runtime environment reports v24.11.1 (current LTS as of 2025 — SUPPORTED)".
- Potential improvement: Add `.nvmrc` containing `24` (or the exact semver) and an `"engines": { "node": ">=24" }` field to `package.json`. One-line change; eliminates silent version mismatch for anyone using nvm/fnm.
- Customer-value signal: employee productivity | operational efficiency
- Value: medium
- Effort hint: low
- Risk if untouched: A developer on Node 18/20 may hit subtle incompatibilities with Next.js 16 or React 19 APIs without a clear error message, leading to hard-to-diagnose build or runtime failures.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: No `CONTRIBUTING.md` exists. The repo has 2 contributors and a 7-day active history; contribution norms are entirely undocumented.
- Evidence: `05-scale-complexity.md` — "Contributor count: 2; First commit: 2026-05-25; Last commit: 2026-06-01". No `CONTRIBUTING` file referenced in any discovery file; `06-security-compliance.md` lists `LICENSE` presence: **no**, and no contributing guide cited.
- Potential improvement: Add a minimal `CONTRIBUTING.md` covering: branch naming, commit convention (conventional commits already used per CI/CD discovery), PR process, and how to run the test suite locally. Under 60 lines is sufficient.
- Customer-value signal: employee productivity | time-to-market for dependent teams
- Value: low
- Effort hint: low
- Risk if untouched: Low for a 2-person team. Becomes a blocker if the project is handed off or onboards additional engineers during or after SAA 2025 event cycle.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: No local Supabase setup guide or seed-data instructions exist despite the project shipping 6 migration files and a `supabase/seed.sql`. Developers must know the Supabase CLI workflow from memory.
- Evidence: `03-architecture-shape.md` — "supabase/migrations/ — 6 migration files: users/awards/notifications, RLS, prize fields, kudos schema, compose fields, avatars; supabase/seed.sql — seed data for users, depts, hashtags, kudos, awards". `02-tech-stack.md` — "supabase@2.101.0 (CLI, devDep) — `package.json:29`". No setup doc referenced in any discovery file.
- Potential improvement: Add a "Local database setup" section to README (or `docs/local-setup.md`) covering: `supabase start`, `supabase db reset`, and the seed command. The Supabase CLI is already a devDependency — no new tooling required.
- Customer-value signal: employee productivity | time-to-market for dependent teams
- Value: medium
- Effort hint: low
- Risk if untouched: Developers spinning up the project locally will either run against a shared remote Supabase instance (data integrity risk) or spend time discovering the local workflow independently; both outcomes slow iteration.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: The Next.js middleware entry point is named `proxy.ts` instead of the framework-mandated `middleware.ts`. This is a non-standard naming that will silently break i18n routing under standard Next.js expectations and confuses any developer following Next.js documentation.
- Evidence: `03-architecture-shape.md` — "`proxy.ts` — next-intl middleware (locale prefix routing); NOTE: named `proxy.ts`, not `middleware.ts` (`proxy.ts:1`)".
- Potential improvement: Rename `proxy.ts` → `middleware.ts` and update any import references. Document the rename decision in a short inline comment at the file top if a non-standard name was intentional. This is a DX and correctness issue, not a doc gap alone — the doc fix is ensuring README or `docs/system-architecture.md` reflects the actual entry point name.
- Customer-value signal: employee productivity | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Next.js will not auto-discover `proxy.ts` as middleware in a standard setup; if the project is redeployed or Next.js config changes, locale routing silently breaks. New developers following Next.js docs will be confused when debugging routing issues.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: The deployment-target divergence (Vercel active + Terraform AWS ECS infra) is undocumented. `docs/system-architecture.md` exists but the relationship between the two targets is unresolved in any discoverable doc.
- Evidence: `03-architecture-shape.md` — "Deployment-target divergence: `.vercel/` present (active Vercel deployment) alongside `infra/` Terraform ECS Fargate target — two competing deploy paths with no CI/CD pipeline detected". `04-delivery-operations.md` — "Deployment-target divergence: `.vercel/project.json:1` references Vercel project `saa-2025` ... active Vercel deploy coexists with Terraform AWS ECS stack (3 envs: dev/staging/prod)".
- Potential improvement: Add a "Deployment" section to `docs/system-architecture.md` (already exists per discovery) that explicitly states which target is canonical for which environment and the intended migration path (if any). Even a two-sentence clarification removes ambiguity for operators.
- Customer-value signal: operational efficiency | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: An operator deploying from Terraform ECS while Vercel is live, or vice versa, risks environment split-brain. Undocumented divergence is a recurring source of incident during handoffs or on-call escalations.

---

- Status: opportunity
- Category: docs-and-dx
- Observation: The mock auth layer — which drives all UI auth state — is not documented. The hardcoded `SENDER_ID` placeholder in server actions is a temporary state with no issue/TODO context linking to real auth work.
- Evidence: `03-architecture-shape.md` — "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only); `lib/supabase/server.ts` provides DB access but Supabase Auth session is NOT connected — `lib/kudos/actions.ts:23` hardcodes `SENDER_ID = '00000000-0000-0000-0000-000000000001`'". `05-scale-complexity.md` — "TODO/FIXME/XXX density: 4 markers across ~6k LOC".
- Potential improvement: Add an inline comment block at `lib/auth/mock-auth-context.tsx:1` and `lib/kudos/actions.ts:23` explaining the mock auth rationale and linking to the intended real-auth implementation task. Update `docs/system-architecture.md` with a "Auth: current state vs. target state" note. Low effort, high orientation value for any developer touching auth-adjacent code.
- Customer-value signal: employee productivity | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Developers touching auth-adjacent code have no signal that the mock layer is intentionally temporary; they may build features that depend on mock state that will break when real auth is wired.
