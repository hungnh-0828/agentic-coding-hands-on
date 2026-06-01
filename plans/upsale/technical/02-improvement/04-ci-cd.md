# Improvement Aspect: CI/CD — agentic-coding-hands-on
**Use context:** internal

- Status: opportunity
- Category: ci-cd
- Observation: No CI/CD pipeline exists in any form — no `.github/workflows/`, no Jenkinsfile, no GitLab CI, no CircleCI config. All deployments and quality checks are purely manual.
- Evidence: `plans/upsale/technical/01-discovery/04-delivery-operations.md:4` — "CI/CD provider + pipeline stages: (none) — no `.github/workflows/`, no Jenkinsfile, no `.gitlab-ci.yml`, no `azure-pipelines.yml`, no `.circleci/config.yml` found at repo root. Deployment is manual."
- Potential improvement: Add a GitHub Actions workflow with three jobs: (1) `lint-and-typecheck` running `eslint` + `tsc --noEmit`, (2) `test` running `vitest run` + `playwright test`, (3) `deploy` gated on both passing — targeting Vercel (current active deploy) via `vercel --prod`. A single `ci.yml` file covers the full quality gate with no additional tooling cost.
- Customer-value signal: operational efficiency | time-to-market for dependent teams | risk reduction
- Value: high
- Effort hint: low
- Risk if untouched: Regressions ship silently; every merge is a manual gamble. With two contributors and a live event deadline, a broken build discovered post-deploy has no automated rollback path and no quality history to audit.

---

- Status: opportunity
- Category: ci-cd
- Observation: ESLint 9 and TypeScript compiler are configured but never run automatically. Lint and type-check failures accumulate silently between developer runs.
- Evidence: `plans/upsale/technical/01-discovery/02-tech-stack.md:36-38` — "ESLint 9 flat config — `eslint.config.mjs`; TypeScript compiler (tsc) — `tsconfig.json` (target: ES2017, strict: true)"; `04-delivery-operations.md:4` confirms no CI pipeline runs them.
- Potential improvement: Add a `lint` step in the CI workflow: `npm run lint && npx tsc --noEmit`. Both tools are already installed; no new dependencies. Runs in under 30 seconds on this codebase (~6k LOC).
- Customer-value signal: operational efficiency | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Type errors and lint violations accumulate; `strict: true` loses its value as a safety net when it is never enforced in a shared gate.

---

- Status: opportunity
- Category: ci-cd
- Observation: Vitest (unit) and Playwright (e2e) test suites exist but are never run in a pipeline. No coverage report is generated or tracked.
- Evidence: `04-delivery-operations.md:6-8` — "Frameworks present: Vitest ^2.1.9 (unit); Playwright ^1.60.0 (e2e, chromium only); Coverage file: (none) — no `coverage/` directory, no `lcov.info`, no `c8`/`istanbul` config"; `vitest.config.ts:15` and `e2e/` (14 tests, 4 spec files).
- Potential improvement: Run `vitest run --coverage` and `playwright test` as separate CI jobs. Upload the coverage report as a CI artifact. No new test infrastructure needed — both runners are already installed.
- Customer-value signal: operational efficiency | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Existing tests provide zero gate value; a broken server action or navigation regression can reach the live event platform undetected.

---

- Status: opportunity
- Category: ci-cd
- Observation: The Terraform IaC stack (3 envs: dev/staging/prod) has no `plan`/`apply` automation. Infra changes require manual CLI execution with no peer-review gate, no drift detection, and no apply audit log.
- Evidence: `04-delivery-operations.md:12-13` — "Terraform remote state: S3 bucket `webapp-tf-state-{env}` + DynamoDB lock table `webapp-tf-locks-{env}`, region `ap-southeast-1` (`infra/envs/dev/backend.tf:4-9`)"; `04-delivery-operations.md:4` confirms no CI pipeline; `08-platform-support.md:11` — "Self-hosted / on-premise: Terraform (AWS ECS Fargate + ALB + Aurora + S3 + Lambda, 3 envs)".
- Potential improvement: Add a `terraform-ci` GitHub Actions workflow: `terraform fmt --check` + `terraform validate` + `terraform plan` on PR (plan output posted as PR comment); `terraform apply` on merge to main, scoped to the target env via path filter (`infra/envs/dev/**`, etc.). Use OIDC for AWS credentials — no long-lived secrets in CI.
- Customer-value signal: operational efficiency | risk reduction | reliability
- Value: high
- Effort hint: medium
- Risk if untouched: Manual Terraform applies to prod Aurora/ECS with no review gate or audit trail. A misapplied change can destroy the RDS cluster or take down ECS service with no rollback record.

---

- Status: opportunity
- Category: ci-cd
- Observation: ECS Fargate infra references an ECR container image via `var.container_image` but the repository contains no Dockerfile — the container build step is entirely absent from the delivery path.
- Evidence: `04-delivery-operations.md:10-11` — "No root `Dockerfile` or `docker-compose*.yml` — verified at repo root; Terraform ECS Fargate module provisions an ECR repository and expects a container image via `var.container_image` (`infra/modules/ecs/main.tf:4,8`) — image build path not defined in repo"; `08-platform-support.md:16` — "no root Dockerfile (ECS Fargate infra references ECR but no app Dockerfile at repo root)".
- Potential improvement: Add a `Dockerfile` (multi-stage: `node:24-alpine` builder → `node:24-alpine` runner) and a `build-and-push` CI job that builds the image, tags it `{env}-{git-sha}`, and pushes to ECR. Wire the resulting image tag into the Terraform `var.container_image` via CI environment variables. Without this, the AWS ECS deploy path is permanently broken regardless of Terraform apply automation.
- Customer-value signal: operational efficiency | platform capability | reliability
- Value: high
- Effort hint: medium
- Risk if untouched: The ECS/Fargate deployment target (the AWS path chosen for prod) cannot function at all. The team is locked onto Vercel indefinitely with no validated fallback.

---

- Status: opportunity
- Category: ci-cd
- Observation: Two concurrent deployment targets — Vercel (`.vercel/project.json`) and Terraform AWS ECS (3 envs) — coexist with no CI gate routing between them, no documented promotion path, and no gating on environment parity.
- Evidence: `03-architecture-shape.md:56` — "Deployment-target divergence: `.vercel/` present (active Vercel deployment) alongside `infra/` Terraform ECS Fargate target — two competing deploy paths with no CI/CD pipeline detected"; `08-platform-support.md:24` — "two concurrent deployment targets, relationship unresolved (`scout-report.md:150`)".
- Potential improvement: Define a single authoritative deploy path in CI: either promote Vercel as the canonical target (and retire/archive the ECS infra) or commit to ECS (add Dockerfile + ECR push + Terraform apply pipeline) and remove the Vercel project. Both are valid; the ambiguity itself is the risk. Document the decision in the CI workflow as the single source of truth.
- Customer-value signal: operational efficiency | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Team members may apply Terraform to AWS infra while the live app runs on Vercel, creating divergent environment states, wasted infra cost, and confusion about which environment users actually hit.
