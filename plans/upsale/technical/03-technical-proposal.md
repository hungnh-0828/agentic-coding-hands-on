# Technical Proposal — agentic-coding-hands-on
**Use context:** internal

_Repository analysis distilled to the 30 highest-leverage internal-platform improvements for this customer._

## Architecture · 3 items · max=high · effort=low–medium
<!-- aspect-id: architecture -->

### Wire real Supabase Auth session (replace split auth halves)

- **Value:** high
- **Need:** `MockAuthProvider` drives all UI auth state; `lib/supabase/server.ts` provides DB access but Supabase Auth session is NOT connected; `lib/kudos/actions.ts:23` hardcodes `SENDER_ID = '00000000-0000-0000-0000-000000000001'` (`03-architecture-shape.md:57`)
- **Benefits:** Eliminates corrupt kudos attribution, closes an audit-trail gap that makes the feature non-functional for real multi-user use, and unblocks all per-user features (notifications, leaderboard, export ACL). Directly reduces operational risk before any real employee audience is reached.
- **Proposed solution:** Wire Supabase Auth server session into the existing `createServerClient` factory (`lib/supabase/server.ts`) and propagate the authenticated user ID to server actions, replacing the hardcoded `SENDER_ID`. The mock context can remain for local dev/testing behind an env flag. Contained to `lib/auth/`, `lib/supabase/server.ts`, and `lib/kudos/actions.ts` with no new dependencies.
- **Effort hint:** medium

### Resolve deployment-target divergence (Vercel vs ECS Fargate)

- **Value:** high
- **Need:** `.vercel/project.json` references active Vercel deployment and `infra/` Terraform ECS Fargate stack coexist with two competing deploy paths and no CI/CD pipeline; Terraform ECS module provisions ECR but no `Dockerfile` exists in repo (`03-architecture-shape.md:56`; `04-delivery-operations.md:11,13`)
- **Benefits:** Removes deployment ambiguity that makes rollbacks unclear, eliminates dead infrastructure spend (ECS path is currently non-deployable), and unblocks CI/CD pipeline design currently blocked by the dual-target ambiguity. Reduces time-to-market for dependent teams.
- **Proposed solution:** Designate one target as authoritative and archive the other. If ECS is the production path, add a `Dockerfile` and wire it to the Terraform ECR variable; remove or document Vercel config as dev-only. If Vercel is the production path, document Terraform infra as aspirational and stop maintaining both. Resolving this unlocks CI/CD pipeline design.
- **Effort hint:** low

### Rename `proxy.ts` to `middleware.ts`

- **Value:** medium
- **Need:** Next.js i18n middleware is named `proxy.ts` at the repo root instead of the framework-mandated `middleware.ts`, breaking Next.js middleware auto-loading; i18n middleware likely not executing in production (`03-architecture-shape.md:41,50`)
- **Benefits:** Eliminates a latent correctness bug where locale routing, auth guards, or other middleware logic may not be applied consistently. Eliminates contributor confusion and upgrade-tool friction.
- **Proposed solution:** Rename `proxy.ts` to `middleware.ts` (one-file `git mv`). Verify that any import or `next.config` reference naming the old file is updated. Zero logic changes required.
- **Effort hint:** low

## Code Quality · 3 items · max=high · effort=low
<!-- aspect-id: code-quality -->

### Replace hardcoded SENDER_ID with session-derived user ID

- **Value:** high
- **Need:** `lib/kudos/actions.ts:23` hardcodes `SENDER_ID = "00000000-0000-0000-0000-000000000001"` as a named constant; `createKudos` and `toggleKudosLike` use this identity for all kudos mutations (`03-architecture-shape.md:57`; `05-scale-complexity.md:20`)
- **Benefits:** Prevents every historical kudos record from carrying the wrong author when real auth is wired, avoiding a costly data backfill. Eliminates a critical data-integrity risk before the platform launches.
- **Proposed solution:** Replace the constant with a call to the session-aware server Supabase client (`lib/supabase/server.ts`) to extract the real user ID. Remove the TODO comment once resolved. One-file change; `createKudos` and `toggleKudosLike` already accept `userId` as parameter so the call-site fix is contained.
- **Effort hint:** low

### Rename proxy.ts to middleware.ts (code-quality alignment)

- **Value:** medium
- **Need:** `proxy.ts` named non-standard for Next.js App Router convention; future contributors and automated migration tooling (e.g., Next.js codemods) will fail to locate or process the middleware file (`03-architecture-shape.md:41,51`)
- **Benefits:** Immediate DX improvement; eliminates upgrade-path friction that compounds over time. Aligns with the framework convention already established in every Next.js project.
- **Proposed solution:** `git mv proxy.ts middleware.ts`. Verify `next.config.ts` has no explicit `matcher` override pointing to the old name. Zero-logic change.
- **Effort hint:** low

### Rename `mock-auth-context.tsx` to `auth-context.tsx`

- **Value:** medium
- **Need:** `lib/auth/mock-auth-context.tsx` is imported by 6 production files under its "mock" name, embedding a prototype-quality label into the live codebase's import graph; 6 import sites: `login-form.tsx`, `notification-bell.tsx`, `auth-guard.tsx`, `account-menu.tsx`, `kudos-board-context.tsx`, `app/[locale]/layout.tsx` (`03-architecture-shape.md:47`)
- **Benefits:** Decouples 6 consumers from the "mock" label and creates a clean swap point for future real Supabase Auth provider. Removes the risk that code reviewers under-scrutinize auth changes because the file reads as temporary.
- **Proposed solution:** Rename to `lib/auth/auth-context.tsx` with an interface that both the current mock provider and a future real Supabase Auth provider implement. No behavior change required now — naming and interface extraction only.
- **Effort hint:** low

## Test Coverage · 4 items · max=medium · effort=low
<!-- aspect-id: test-coverage -->

### Add coverage provider and baseline thresholds

- **Value:** medium
- **Need:** No coverage provider installed; `vitest.config.ts` defines no `coverage` block; no `@vitest/coverage-v8` or `@vitest/coverage-istanbul` in `package.json`; no baseline has ever been generated (`vitest.config.ts` 18 lines, no coverage key; `04-delivery-operations.md` — "Coverage file: (none)")
- **Benefits:** Gives the team a concrete coverage baseline and a gate to enforce, reducing the risk of undetected regressions in business logic (`lib/kudos/`, `lib/auth/`).
- **Proposed solution:** Add `@vitest/coverage-v8` (zero-config, wraps Node V8 coverage), add a `coverage` block to `vitest.config.ts` with `provider: "v8"`, `include: ["{lib,components,app}/**"]`, and thresholds (`lines: 70, functions: 70, branches: 60`). Add `"test:coverage": "vitest run --coverage"` to `package.json` scripts.
- **Effort hint:** low

### Add unit tests for mock auth context

- **Value:** medium
- **Need:** `lib/auth/mock-auth-context.tsx` — the sole auth layer driving all UI auth state (imported by 6 files) — has no test file; `ls lib/auth/__tests__/` returns empty (`03-architecture-shape.md` — "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only)")
- **Benefits:** Any change to the mock auth context (e.g., when real Supabase Auth replaces the mock) gives automated signal before breaking auth-dependent UI flows across 6 consumers. Reduces risk during the highest-impact planned migration.
- **Proposed solution:** Add `lib/auth/__tests__/mock-auth-context.test.tsx` covering: (a) `MockAuthProvider` default unauthenticated state, (b) login/logout state transitions, (c) `useMockAuth` throws outside provider. Requires `jsdom` environment for this test file (set per-file via `// @vitest-environment jsdom`).
- **Effort hint:** low

### Add e2e coverage for admin dashboard

- **Value:** medium
- **Need:** `app/[locale]/admin-dashboard/page.tsx` — the highest-privilege route in the app — has zero automated verification; e2e grep for "admin" returns 0 results across all 3 spec files (`07-product-surface.md`; `04-delivery-operations.md` — e2e dir: `e2e/auth.spec.ts`, `e2e/navigation.spec.ts`, `e2e/kudos.spec.ts`)
- **Benefits:** Catches award management regressions (broken admin gate, corrupted award state) before they reach production; admin paths carry the highest data-integrity risk and are exercised least during development.
- **Proposed solution:** Add `e2e/admin.spec.ts` covering: route guard (unauthenticated → redirect), admin page renders award list, and at least one CRUD action (award status change). Feasible because `lib/auth/mock-auth-context.tsx` already supports setting an admin role — no real backend plumbing needed for the test.
- **Effort hint:** low

### Add `test:coverage` script to package.json

- **Value:** medium
- **Need:** `package.json:10-11` — `"test": "vitest run"` has no `--coverage` flag; no CI invocation exists (`04-delivery-operations.md` — "CI/CD provider: (none)"); team has no data to decide whether threshold enforcement is feasible
- **Benefits:** Enables the team to measure the current coverage baseline and provides the prerequisite step before any CI gate can enforce thresholds. Low effort, high ongoing visibility value.
- **Proposed solution:** Add `"test:coverage": "vitest run --coverage"` to `package.json` scripts once coverage provider is added (see entry above). Scoped to test-coverage; CI pipeline setup belongs to the CI/CD aspect.
- **Effort hint:** low

## CI/CD · 6 items · max=high · effort=low–medium
<!-- aspect-id: ci-cd -->

### Bootstrap GitHub Actions CI pipeline

- **Value:** high
- **Need:** No CI/CD pipeline exists in any form — no `.github/workflows/`, no Jenkinsfile, no GitLab CI, no CircleCI config; all deployments and quality checks are purely manual (`04-delivery-operations.md:4`)
- **Benefits:** Prevents silent regressions on every merge. With two contributors and a live event deadline, a broken build discovered post-deploy has no automated rollback path and no quality history to audit. Reduces time-to-market and operational risk simultaneously.
- **Proposed solution:** Add a GitHub Actions workflow (`ci.yml`) with three jobs: (1) `lint-and-typecheck` running `eslint` + `tsc --noEmit`, (2) `test` running `vitest run` + `playwright test`, (3) `deploy` gated on both passing — targeting Vercel (current active deploy) via `vercel --prod`. All tools already installed; no additional tooling cost.
- **Effort hint:** low

### Add Terraform CI/CD pipeline

- **Value:** high
- **Need:** Terraform IaC stack (3 envs: dev/staging/prod) has no `plan`/`apply` automation; infra changes require manual CLI execution with no peer-review gate, no drift detection, and no apply audit log (`04-delivery-operations.md:4,12-13`; `08-platform-support.md:11`)
- **Benefits:** Eliminates the risk of manual Terraform applies to prod Aurora/ECS with no review gate or audit trail. A misapplied change can destroy the RDS cluster or take down the ECS service with no rollback record.
- **Proposed solution:** Add a `terraform-ci` GitHub Actions workflow: `terraform fmt --check` + `terraform validate` + `terraform plan` on PR (plan output posted as PR comment); `terraform apply` on merge to main, scoped to target env via path filter (`infra/envs/dev/**`, etc.). Use OIDC for AWS credentials — no long-lived secrets in CI.
- **Effort hint:** medium

### Add Dockerfile and container build job

- **Value:** high
- **Need:** ECS Fargate infra references an ECR container image via `var.container_image` but repository contains no Dockerfile — container build step is entirely absent; no root `Dockerfile` or `docker-compose*.yml` (`04-delivery-operations.md:10-11`; `08-platform-support.md:16`)
- **Benefits:** Unblocks the ECS/Fargate deployment target (currently permanently broken). Enables the team to validate the AWS production path and stop being locked onto Vercel indefinitely with no validated fallback.
- **Proposed solution:** Add a `Dockerfile` (multi-stage: `node:24-alpine` builder → `node:24-alpine` runner) and a `build-and-push` CI job that builds the image, tags it `{env}-{git-sha}`, and pushes to ECR. Wire the resulting image tag into Terraform `var.container_image` via CI environment variables.
- **Effort hint:** medium

### Enforce lint and type-check in CI

- **Value:** medium
- **Need:** ESLint 9 and TypeScript compiler configured but never run automatically; lint and type-check failures accumulate silently between developer runs (`02-tech-stack.md:36-38`; `04-delivery-operations.md:4`)
- **Benefits:** `strict: true` regains its safety-net value when enforced in a shared gate. Prevents type errors and lint violations from accumulating across contributors.
- **Proposed solution:** Add a `lint` step in the CI workflow: `npm run lint && npx tsc --noEmit`. Both tools already installed; no new dependencies. Runs in under 30 seconds on this codebase (~6k LOC).
- **Effort hint:** low

### Run test suites in CI

- **Value:** medium
- **Need:** Vitest (unit) and Playwright (e2e) test suites exist but never run in a pipeline; no coverage report generated or tracked (`04-delivery-operations.md:6-8` — "Coverage file: (none); vitest.config.ts:15; e2e/ 14 tests, 4 spec files")
- **Benefits:** Existing tests provide zero gate value without CI; a broken server action or navigation regression can reach the live event platform undetected. CI makes the test investment pay off.
- **Proposed solution:** Run `vitest run --coverage` and `playwright test` as separate CI jobs. Upload the coverage report as a CI artifact. No new test infrastructure needed — both runners already installed.
- **Effort hint:** low

### Define single authoritative deploy path in CI

- **Value:** medium
- **Need:** Two concurrent deployment targets — Vercel (`.vercel/project.json`) and Terraform AWS ECS (3 envs) — coexist with no CI gate routing between them and no documented promotion path (`03-architecture-shape.md:56`; `08-platform-support.md:24`)
- **Benefits:** Eliminates the risk of divergent environment states where team members apply Terraform to AWS while the live app runs on Vercel, causing wasted infra cost and user confusion about which environment is authoritative.
- **Proposed solution:** Define a single authoritative deploy path in CI: either promote Vercel as the canonical target (retire/archive ECS infra) or commit to ECS (add Dockerfile + ECR push + Terraform apply pipeline) and remove the Vercel project. Document the decision in the CI workflow as the single source of truth.
- **Effort hint:** low

## Performance · 2 items · max=medium · effort=low
<!-- aspect-id: performance -->

### Enable AVIF image format for LCP images

- **Value:** medium
- **Need:** `hero-bg.png` (4.3 MB raw PNG) and `login-keyvisual.png` (2.5 MB raw PNG) served via `next/image` with no AVIF config; `next.config.ts:10-16` has `images.remotePatterns` only — no `formats`, no `quality`, no `deviceSizes`; both images use `priority sizes="100vw"` without `quality` override (`components/hero/hero-section.tsx:19-26`; `app/[locale]/login/page.tsx:38-43`)
- **Benefits:** AVIF for a 4.3 MB hero at q80 typically yields < 400 KB — a ~10× reduction with no visual change. Directly improves LCP and first meaningful paint for all employees on event launch day, particularly on corporate Wi-Fi or mobile connections.
- **Proposed solution:** Add `images: { formats: ["image/avif", "image/webp"] }` to `next.config.ts` to enable AVIF serving for supporting browsers (Chrome, Firefox, Safari 16+). Set `quality={80}` on both LCP images. AVIF is already supported natively by Next.js Image — only a config change needed.
- **Effort hint:** low

### Cache kudos board data with Next.js `unstable_cache`

- **Value:** medium
- **Need:** `fetchKudosBoard()` fires 6 parallel Supabase queries on every page request with no Next.js data cache layer; `lib/kudos/actions.ts:25-27` uses `revalidatePath` on mutation — intent to cache + invalidate exists but cache is never set (`lib/kudos/queries.ts:34-41`; `app/[locale]/sun-kudos/page.tsx:42-45`)
- **Benefits:** Converts the hot read path from 6-query fan-out per request to a single cache hit for all concurrent users. Prevents connection exhaustion on Supabase free/shared tiers at event launch day concurrency (50 users × 6 queries = 300 simultaneous DB connections).
- **Proposed solution:** Wrap `fetchKudosBoard` in Next.js `unstable_cache` with a `["kudos-board"]` tag and `revalidate: 30`. Replace existing `revalidatePath` calls in `actions.ts` with `revalidateTag("kudos-board")` for precise invalidation on write. Targeted change to `lib/kudos/queries.ts` and `lib/kudos/actions.ts`.
- **Effort hint:** low

## Security & Dependencies · 4 items · max=high · effort=low–medium
<!-- aspect-id: security-and-dependencies -->

### Wire real Supabase Auth to close identity spoofing

- **Value:** high
- **Need:** Authentication entirely mocked — `MockAuthProvider` drives all UI auth state with no real Supabase Auth session; all server actions use hardcoded `SENDER_ID = "00000000-0000-0000-0000-000000000001"` (`lib/auth/mock-auth-context.tsx:1`; `lib/kudos/actions.ts:23`; STRIDE/OWASP audit commit 3585746; `03-architecture-shape.md:57`)
- **Benefits:** Closes the trivially-reachable identity spoofing vector before the platform launches internally. Any browser user can currently submit kudos as any identity; this eliminates spoof attacks and data-integrity failures.
- **Proposed solution:** Replace `MockAuthProvider` with `@supabase/ssr` session handling, derive `sender_id` from the authenticated JWT on the server action, and add an `auth-guard` that rejects unauthenticated requests at the action boundary. One-time integration using established Supabase patterns already present in the stack.
- **Effort hint:** medium

### Tighten RLS policies to prevent anon read of full dataset

- **Value:** high
- **Need:** RLS policies in `0002_rls_policies.sql` grant read access to all rows for `anon` and `authenticated` roles with no row-level filter; `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally client-exposed, so the full dataset (users, kudos, awards) is readable by anyone with the published key (OWASP audit — permissive RLS; `06-security-compliance.md:54`)
- **Benefits:** Prevents full dataset exfiltration via the publicly-available anon key. This is a policy-scoping problem, not a key-rotation problem — the fix is tightening row-level predicates, not rotating secrets.
- **Proposed solution:** Tighten RLS `SELECT` policies to scope rows by `auth.uid()` or a department predicate once real auth is wired. Until auth is live, add `USING (false)` guards on write policies to prevent any anon writes. Cross-reference with STRIDE audit (commit 3585746) for the full policy change list.
- **Effort hint:** low

### Patch vulnerable `esbuild@0.21.5` (GHSA-67mh-4wv8-2f99)

- **Value:** medium
- **Need:** `esbuild@0.21.5` is a known-vulnerable version (CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N); dev server accepts cross-origin requests, allowing any website to read build responses; fix available at `esbuild@0.25.0` (`06-security-compliance.md:13,28`; `package-lock.json:4789`)
- **Benefits:** Mitigates GHSA-67mh-4wv8-2f99 for developers running the local dev server on shared or semi-trusted networks (office Wi-Fi, remote). Risk is dev-only since esbuild is not shipped to production.
- **Proposed solution:** Bump `esbuild` to ≥ 0.25.0 via an `overrides` entry in `package.json`: `"overrides": { "esbuild": ">=0.25.0" }`. As a transitive devDependency, a direct `overrides` entry is the correct mechanism.
- **Effort hint:** low

### Add automated dependency-vulnerability scanning

- **Value:** medium
- **Need:** No Dependabot, Renovate, Snyk, `npm audit` CI step, or equivalent scanner configured; single security artifact is a manual one-time audit (commit 3585746) (`06-security-compliance.md:47-48`)
- **Benefits:** New CVEs accumulate silently without automated tooling; the next known-bad dependency will only be discovered by another manual audit, likely after the vulnerability is publicly exploited. Low effort, high ongoing operational-efficiency value.
- **Proposed solution:** Add `dependabot.yml` (GitHub native, zero-cost) for weekly npm PR creation, and add an `npm audit --audit-level=high` step to the CI pipeline. For the Terraform stack, add `trivy config infra/` or `checkov` scan. Both are low-effort additions to existing tooling.
- **Effort hint:** low

## Observability · 2 items · max=high · effort=low
<!-- aspect-id: observability -->

### Add structured logging to server actions and query layer

- **Value:** high
- **Need:** Zero structured logging exists in application code; no logging library (pino, winston, etc.) imported anywhere in `lib/` or `app/`; CloudWatch log groups provisioned in Terraform for ECS and Lambda but unconnected to app code (`04-delivery-operations.md:15`)
- **Benefits:** Silent failures in production (when `createKudos` or `toggleKudosLike` throw a DB/auth error) become observable. Eliminates the need to redeploy code to add logging retroactively during an incident, directly reducing mean-time-to-resolve.
- **Proposed solution:** Add pino (zero-dep, JSON-native) as a singleton logger in `lib/logger.ts`; instrument server actions (`lib/kudos/actions.ts`) and query layer (`lib/kudos/queries.ts`) with structured log lines at request start, DB call result, and error boundary. Output JSON so CloudWatch Logs Insights can filter/query without custom parsing.
- **Effort hint:** low

### Integrate error reporting (Sentry)

- **Value:** high
- **Need:** No error reporting service wired; runtime exceptions in Next.js server actions and RSC renders are swallowed silently; no aggregated error view, alerting, or stack-trace capture (`04-delivery-operations.md:18` — "Error reporting: (none)")
- **Benefits:** Employee-reported bugs become correlatable with server-side stack traces. The mock auth `SENDER_ID` hardcode (`lib/kudos/actions.ts:23`) and multi-query fan-out (`lib/kudos/queries.ts:34`) are both silent failure points that, without error capture, produce invisible data inconsistency during the SAA event window.
- **Proposed solution:** Integrate `@sentry/nextjs` (App Router SDK supports both RSC and server actions). Configure `sentry.server.config.ts` and `sentry.client.config.ts`; wrap server actions with Sentry's `withServerActionInstrumentation`. Sentry free tier covers the traffic volume of an internal employee awards platform.
- **Effort hint:** low

## New Features · 3 items · max=high · effort=low–medium
<!-- aspect-id: new-features -->

### Implement notification write path for kudos events

- **Value:** high
- **Need:** `notifications` table (id, user_id, title, body, read_at, created_at) with unread index exists in migration 0001; unread count surfaced in header bell (`components/header/site-header.tsx:14-26`); no `insertNotification` / `markRead` action found across `lib/` or `app/` (`supabase/migrations/0001_initial_schema.sql:24-34`; `components/header/notification-bell.tsx:8`)
- **Benefits:** The bell UI exists and shows a badge but never reflects real events — employees see a broken notification promise, eroding trust in the platform. Completing this eliminates the mismatch between the visible UI affordance and missing backend behavior.
- **Proposed solution:** Add a `"use server"` action triggered by `createKudos` to insert a notification row for the receiver, and a second action to mark all as read when the bell panel is opened. Supabase Realtime can push count updates to the client via `supabase.channel()` — no additional infrastructure needed.
- **Effort hint:** low

### Add admin data export endpoint

- **Value:** high
- **Need:** Admin dashboard route exists (`app/[locale]/admin-dashboard/page.tsx`) but no data export capability present; award nominees and kudos volume are tracked in structured tables with no way to extract a CSV/XLSX snapshot for award committee review; `find app -name "route.ts"` returned empty (`07-product-surface.md:9`; `supabase/migrations/0004_kudos_schema.sql:19-26`)
- **Benefits:** Award committee must currently screenshot or manually query the DB to compile nominee shortlists — high manual effort at a time-sensitive stage of the awards cycle. A CSV export eliminates this bottleneck entirely.
- **Proposed solution:** Add `app/[locale]/admin-dashboard/export/route.ts` Next.js route handler that streams a CSV of kudos (sender, receiver, dept, hashtags, like count, timestamp) using the existing Supabase server client. Gate by `users.role = 'admin'` RLS or server-side role check.
- **Effort hint:** low

### Wire Supabase Auth with OAuth SSO (Google/Azure AD)

- **Value:** high
- **Need:** `MockAuthProvider` hardcodes a single mock user; `SENDER_ID = "00000000-0000-0000-0000-000000000001"` hardcoded in `actions.ts` and `site-header.tsx`; `supabase/config.toml:314-316` lists Google, Azure, WorkOS, Slack as supported OAuth providers but none are wired (`lib/auth/mock-auth-context.tsx:1`; `lib/kudos/actions.ts:23`; `components/header/site-header.tsx:12`)
- **Benefits:** Unblocks all per-user features (notifications, leaderboard, export ACL) and makes award integrity verifiable. This is the highest-leverage single change given the stack already has Supabase Auth configured — all downstream features depend on a real identity.
- **Proposed solution:** Replace `MockAuthProvider` with Supabase Auth (`@supabase/auth-js` + `@supabase/ssr`). Use `supabase.auth.signInWithOAuth` or `signInWithPassword`; read session server-side via `supabase.auth.getUser()` in server components and actions. Unblocks the `TODO(auth)` items in `lib/kudos/actions.ts:22,31,32` and enables RLS enforcement in `supabase/migrations/0002_rls_policies.sql`.
- **Effort hint:** medium

## Ecosystem Parity · 3 items · max=high · effort=low–high
<!-- aspect-id: ecosystem-parity -->

### Rename middleware file to `middleware.ts` (framework compliance)

- **Value:** high
- **Need:** Next.js 16 requires middleware file named `middleware.ts` at project root; project uses `proxy.ts` which the framework does not auto-detect as middleware (`proxy.ts:1`; `03-architecture-shape.md:41`)
- **Benefits:** Eliminates the risk of the framework silently skipping the file on cold-start or after a Next.js patch that tightens middleware-detection, which would break locale routing and any future session refresh logic for all users with no warning.
- **Proposed solution:** Rename `proxy.ts` → `middleware.ts`. Single-file rename with no logic change; next-intl, session refresh, and locale routing all continue to work. The file is correctly structured and already exports the `config` object — only the filename is wrong.
- **Effort hint:** low

### Add Supabase session refresh to middleware

- **Value:** high
- **Need:** `@supabase/ssr` middleware pattern requires a session-refresh pass in middleware (calling `supabase.auth.getUser()` to extend cookies); current `proxy.ts`/`middleware.ts` only runs next-intl routing without any Supabase session refresh, leaving authenticated sessions unable to renew on the server (`lib/supabase/server.ts:1-29`; `03-architecture-shape.md:57`; `lib/kudos/actions.ts:23`)
- **Benefits:** Without session refresh in middleware, Supabase JWT cookies expire silently causing random 401s mid-session. Enables RLS policies relying on `auth.uid()` (already a TODO in `lib/kudos/actions.ts:31`) to be enforced.
- **Proposed solution:** When real Supabase Auth is adopted, extend `middleware.ts` to call `createServerClient` + `supabase.auth.getUser()` per the `@supabase/ssr` docs pattern. Enables RLS to use `auth.uid()` in Supabase policies (`supabase/migrations/0002_rls_policies.sql`).
- **Effort hint:** medium

### Replace MockAuthProvider with Supabase Auth (`@supabase/ssr`)

- **Value:** high
- **Need:** Project wires `@supabase/ssr` cookie helpers correctly for server client but all application auth state is sourced from `MockAuthProvider` (in-memory client context); `useUser()` / `getUser()` from `@supabase/auth-js` are never called; admin-dashboard access control enforced only client-side via mock role state (`lib/auth/mock-auth-context.tsx:1-46`; `03-architecture-shape.md:57`; `07-product-surface.md:23`; `lib/kudos/actions.ts:23`)
- **Benefits:** Closes the server-side identity gap that makes all kudos attributable to one placeholder user. Eliminates trivial client-side role bypass for admin access. Unblocks all `TODO(auth)` items and enables real RLS enforcement across the board.
- **Proposed solution:** Replace `MockAuthProvider` with Supabase Auth (`@supabase/auth-js` + `@supabase/ssr`). Use `supabase.auth.signInWithOAuth` or `signInWithPassword`; read session server-side via `supabase.auth.getUser()` in server components and actions. Resolves `lib/kudos/actions.ts:22,31,32` TODOs and enables `supabase/migrations/0002_rls_policies.sql` RLS enforcement.
- **Effort hint:** high
