# Delivery & Operations — agentic-coding-hands-on (saa-2025)
**Use context:** internal

- **CI/CD provider + pipeline stages:** (none) — no `.github/workflows/`, no Jenkinsfile, no `.gitlab-ci.yml`, no `azure-pipelines.yml`, no `.circleci/config.yml` found at repo root (verified: `plans/upsale/scout-report.md:149`). Deployment is manual.
- **Testing story:**
  - Frameworks present: Vitest `^2.1.9` (unit) — `package.json:32`; Playwright `^1.60.0` (e2e, chromium only) — `package.json:22`
  - Coverage file: `(none)` — no `coverage/` directory, no `lcov.info`, no `c8`/`istanbul` config
  - Test directory layout: unit tests under `{lib,components,app}/**/*.{test,spec}.{ts,tsx}` (`vitest.config.ts:15`); e2e under `e2e/` (`e2e/auth.spec.ts`, `e2e/navigation.spec.ts`, `e2e/kudos.spec.ts` — 14 tests total)
- **Containerization:**
  - No root `Dockerfile` or `docker-compose*.yml` — verified at repo root (`plans/upsale/scout-report.md:149`)
  - Terraform ECS Fargate module provisions an ECR repository and expects a container image via `var.container_image` (`infra/modules/ecs/main.tf:4,8`) — image build path not defined in repo
  - Terraform remote state: S3 bucket `webapp-tf-state-{env}` + DynamoDB lock table `webapp-tf-locks-{env}`, region `ap-southeast-1` (`infra/envs/dev/backend.tf:4-9`); same pattern for staging/prod
  - Deployment-target divergence: `.vercel/project.json:1` references Vercel project `saa-2025` (org `team_adFuR8u6uBJSKvMIRK4liY84`) — active Vercel deploy coexists with Terraform AWS ECS stack (3 envs: dev/staging/prod via `infra/envs/`)
- **Observability signals:**
  - Logging library: `(none)` — no pino, winston, structlog, or equivalent imported in `lib/` or `app/`; no `console.*` calls detected in `lib/`. CloudWatch log groups provisioned in Terraform for ECS (`infra/modules/ecs/main.tf:42-44`) and Lambda (`infra/modules/lambda/main.tf:8-10`) with configurable `retention_in_days`
  - Metrics endpoint: `(none)` — no `/metrics` route, no Prometheus scrape config
  - Tracing SDK: `(none)` — no OTel, Datadog, or New Relic imports found
  - Error reporting: `(none)` — no Sentry, Bugsnag, or Rollbar found in `package.json` or source imports

<!-- Total length under 120 lines. Snapshot only — no narration. -->
