---
item_index: 6
item_slug: bootstrap-github-actions-ci-pipeline-with-lint-tests-and-deploy
track: technical
decision: KEEP
---

# Audits

- **Clause:** No CI/CD pipeline exists in any form — no `.github/workflows/`, no Jenkinsfile, no GitLab CI, no CircleCI config
  - **Evidence:** `04-delivery-operations.md:4` — "CI/CD provider + pipeline stages: (none) — no `.github/workflows/`, no Jenkinsfile, no `.gitlab-ci.yml`, no `azure-pipelines.yml`, no `.circleci/config.yml` found at repo root. Deployment is manual." Repo grep: `find . -path '*/.github/workflows*'` (excluding node_modules) returned no matches; `.github` directory absent at repo root (confirmed live).
  - **Verdict:** correct

- **Clause:** All deployments and quality checks are purely manual (`04-delivery-operations.md:4`)
  - **Evidence:** `04-delivery-operations.md:4` — "Deployment is manual." No CI runner config found at repo root; corroborates item claim verbatim.
  - **Verdict:** correct

- **Clause:** ESLint 9 and TypeScript compiler configured but never run automatically
  - **Evidence:** `02-tech-stack.md:36-37` — "TypeScript compiler (tsc) — `tsconfig.json` (target: ES2017, strict: true)"; "ESLint 9 flat config — `eslint.config.mjs`". `04-delivery-operations.md:4` confirms no CI pipeline exists. `package.json:9` defines `"lint": "eslint"` script, confirming tool is installed. No automation layer found.
  - **Verdict:** correct

- **Clause:** Lint and type-check failures accumulate silently between developer runs (`02-tech-stack.md:36-38`)
  - **Evidence:** `02-tech-stack.md:36-38` documents ESLint 9 and tsc present; `04-delivery-operations.md:4` confirms no CI gate enforces them. The "silently accumulate" assertion is a logical consequence of no CI + tools installed — not a direct metric but a correct operational inference.
  - **Verdict:** correct

- **Clause:** Vitest (unit) and Playwright (e2e) test suites exist but never run in a pipeline
  - **Evidence:** `04-delivery-operations.md:6-8` — "Frameworks present: Vitest `^2.1.9` (unit) — `package.json:32`; Playwright `^1.60.0` (e2e, chromium only) — `package.json:22`". `04-delivery-operations.md:4` confirms no CI pipeline. Both runners confirmed installed live.
  - **Verdict:** correct

- **Clause:** No coverage report generated or tracked (`04-delivery-operations.md:6-8` — "Coverage file: (none); vitest.config.ts:15; e2e/ 14 tests, 4 spec files")
  - **Evidence:** `04-delivery-operations.md:7` — "Coverage file: `(none)` — no `coverage/` directory, no `lcov.info`, no `c8`/`istanbul` config". `vitest.config.ts:15` — `include: ["{lib,components,app}/**/*.{test,spec}.{ts,tsx}"]` (confirmed live; no coverage config block present). e2e directory contains 3 spec files (`auth.spec.ts`, `kudos.spec.ts`, `navigation.spec.ts`) and a `global-setup.ts` — 4 files total, 14 tests asserted in discovery. Note: item states "4 spec files" but repo has 3 `.spec.ts` files + 1 `global-setup.ts`; the "4 spec files" count includes `global-setup.ts`, which is not a spec — minor wording imprecision in the evidence field, not the proposal claim itself, and immaterial to the proposal's validity.
  - **Verdict:** correct

# Reason

Check 1 (holistic): item is fully coherent — Need is backed by confirmed evidence (no `.github/` dir, no CI runner, tools installed but ungated), Proposed solution (single `ci.yml` with lint-and-typecheck, test, deploy jobs) directly addresses every enumerated Need gap, Benefits are concrete (regression prevention, audit trail, test investment actualized), and effort is correctly rated low given no new tooling is required. Check 2: `high` value is defensible — no CI on a live event platform with a hard deadline and no automated rollback path is a concrete production-risk anchor, not soft language. Check 3: use-context `internal` — item's primary lever is operational efficiency and risk reduction, not monetization; passes. Check 4: Benefits are concrete (broken-build-at-event risk, `strict: true` safety-net, test gate value). Check 5: no secrets, no fabricated citations. Check 6: formatting intact. Scope is correctly bounded to app lint/test/deploy; Terraform CI (item-07) and Dockerfile/container build (item-08) are separate items in evidence but not absorbed into this proposal's `ci.yml` scope.

