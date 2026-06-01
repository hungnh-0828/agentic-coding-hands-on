# Improvement Aspect: Architecture — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: architecture
- Observation: `components/kudos/kudos-board-context.tsx` is 216 LOC and imported by 11 files across unrelated component subtrees, functioning as a global grab-bag for kudos board state rather than a focused context boundary.
- Evidence: `03-architecture-shape.md` — "God file — `components/kudos/kudos-board-context.tsx`: 216 LOC, 11 inbound imports … consumers: `spotlight-board.tsx`, `kudos-card.tsx`, `copy-link-button.tsx`, `compose-kudo-modal.tsx`, `kudos-toast.tsx`, `kudos-filters.tsx`, `kudos-sidebar.tsx`, `all-kudos-section.tsx`, `highlight-section.tsx`, `like-button.tsx`, `app/[locale]/sun-kudos/page.tsx`" (`03-architecture-shape.md:45`); `05-scale-complexity.md` — `components/kudos/kudos-board-context.tsx` listed as only source file exceeding 200 LOC outside test files (`05-scale-complexity.md:18`)
- Potential improvement: Split into 2–3 narrower contexts (e.g., board-data context, compose-modal context, toast/notification context). Each consumer imports only the slice it needs. No new library required — React context split is a zero-dep refactor consistent with the existing React 19 / App Router stack.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: medium
- Effort hint: medium
- Risk if untouched: Any state or logic change to this file touches all 11 consumers simultaneously, increasing regression surface per PR and slowing feature iteration. As the kudos feature grows (new filters, real-time updates, admin tools), the coupling will compound; a future refactor under deadline pressure is higher risk than splitting now.

---

- Status: opportunity
- Category: architecture
- Observation: Auth is implemented as two disconnected halves: a client-side `MockAuthProvider` drives all UI auth state, while the server layer (`lib/supabase/server.ts`) provides DB access with no real session; `lib/kudos/actions.ts` hardcodes a static `SENDER_ID` placeholder to work around the missing real identity.
- Evidence: `03-architecture-shape.md` — "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only); `lib/supabase/server.ts` provides DB access but Supabase Auth session is NOT connected — `lib/kudos/actions.ts:23` hardcodes `SENDER_ID = '00000000-0000-0000-0000-000000000001'`" (`03-architecture-shape.md:57`); `07-product-surface.md` — "Auth: mock only — `lib/auth/mock-auth-context.tsx` (no real IdP/SSO SDK detected)" (`07-product-surface.md:23`)
- Potential improvement: Wire Supabase Auth server session into the existing `createServerClient` factory (`lib/supabase/server.ts`) and propagate the authenticated user ID to server actions, replacing the hardcoded `SENDER_ID`. The mock context can remain for local dev/testing behind an env flag. This is a contained change to `lib/auth/`, `lib/supabase/server.ts`, and `lib/kudos/actions.ts` with no new dependencies.
- Customer-value signal: risk reduction | platform capability
- Value: high
- Effort hint: medium
- Risk if untouched: All kudos mutations are attributed to a single hardcoded identity regardless of who is logged in, making the feature non-functional for real multi-user use and creating an audit-trail gap. Any promotion to a real employee audience (even internal) with this code path produces corrupt data.

---

- Status: opportunity
- Category: architecture
- Observation: The Next.js i18n middleware is named `proxy.ts` at the repo root instead of the framework-mandated `middleware.ts`, breaking Next.js middleware auto-loading and deviating from every Next.js convention and tooling assumption.
- Evidence: `03-architecture-shape.md` — "proxy.ts — next-intl middleware (locale prefix routing); NOTE: named `proxy.ts`, not `middleware.ts` (`proxy.ts:1`)" (`03-architecture-shape.md:41`); entry-point table lists `i18n middleware: proxy.ts:1 (non-standard name — Next.js convention is middleware.ts)` (`03-architecture-shape.md:50`)
- Potential improvement: Rename `proxy.ts` to `middleware.ts`. This is a one-file rename with no logic changes. Verify that any import or next.config reference that explicitly names the file is updated. Given Next.js auto-discovery relies on the filename, this likely means the current middleware is not executing at all in production unless a custom config compensates.
- Customer-value signal: risk reduction | operational efficiency
- Value: medium
- Effort hint: low
- Risk if untouched: If middleware is silently not running (Next.js convention bypass), locale routing, auth guards, or any other middleware logic may not be applied consistently — a latent correctness bug that is hard to detect without explicit verification.

---

- Status: opportunity
- Category: architecture
- Observation: Two mutually exclusive deployment targets coexist in the repository without a reconciliation strategy: an active Vercel deployment (`.vercel/project.json`) and a Terraform AWS ECS Fargate stack across dev/staging/prod environments (`infra/envs/`), with no Dockerfile in the repo to build the container image the ECS module expects.
- Evidence: `03-architecture-shape.md` — "Deployment-target divergence: `.vercel/` present (active Vercel deployment) alongside `infra/` Terraform ECS Fargate target — two competing deploy paths with no CI/CD pipeline detected" (`03-architecture-shape.md:56`); `04-delivery-operations.md` — "Deployment-target divergence: `.vercel/project.json:1` references Vercel project `saa-2025` … active Vercel deploy coexists with Terraform AWS ECS stack (3 envs: dev/staging/prod)" (`04-delivery-operations.md:13`); "Terraform ECS Fargate module provisions an ECR repository and expects a container image via `var.container_image` … image build path not defined in repo" (`04-delivery-operations.md:11`); `08-platform-support.md` — "two concurrent deployment targets, relationship unresolved (`scout-report.md:150`)" (`08-platform-support.md:24`)
- Potential improvement: Designate one target as authoritative and archive or remove the other. If ECS is the production path, add a `Dockerfile` and wire it to the Terraform ECR variable; remove or document the Vercel config as dev-only. If Vercel is the production path, document the Terraform infra as aspirational/staging and stop maintaining both. Resolving this unlocks CI/CD pipeline design (currently blocked by ambiguity).
- Customer-value signal: risk reduction | time-to-market for dependent teams
- Value: high
- Effort hint: low
- Risk if untouched: Dual-target ambiguity means deployments are manual and undocumented, rollback paths are unclear, and any infra or app change must be validated against two different runtime environments. The ECS Fargate path is currently non-deployable (no Dockerfile), so it represents dead infrastructure spend if not resolved.
