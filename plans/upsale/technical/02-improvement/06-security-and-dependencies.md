# Improvement Aspect: Security & Dependencies — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: Authentication is entirely mocked — `MockAuthProvider` drives all UI auth state with no real Supabase Auth session. All server actions use a hardcoded `SENDER_ID = "00000000-0000-0000-0000-000000000001"`, meaning any request can impersonate any user and bypass identity checks.
- Evidence: `lib/auth/mock-auth-context.tsx:1` (imported by 6 files); `lib/kudos/actions.ts:23` (`SENDER_ID` placeholder); `plans/reports/security-audit-260601-1019-app-and-infra.md` (STRIDE/OWASP audit commit 3585746 — auth gap confirmed); `03-architecture-shape.md:57` ("Supabase Auth session is NOT connected")
- Potential improvement: Wire Supabase Auth — replace `MockAuthProvider` with `@supabase/ssr` session handling, derive `sender_id` from the authenticated JWT on the server action, and add an `auth-guard` that rejects unauthenticated requests at the action boundary. This is a one-time integration with established Supabase patterns already present in the stack.
- Customer-value signal: risk reduction
- Value: high
- Effort hint: medium
- Risk if untouched: Any browser user can submit kudos as any identity. Spoof attacks and data-integrity failures are trivially reachable before the platform launches internally.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: RLS policies in `0002_rls_policies.sql` grant read access to all rows for both `anon` and `authenticated` roles with no row-level filter, making the entire kudos and user dataset readable by unauthenticated Supabase clients.
- Evidence: `plans/reports/security-audit-260601-1019-app-and-infra.md` (OWASP audit — permissive RLS noted); `06-security-compliance.md:54` ("NEXT_PUBLIC_SUPABASE_ANON_KEY — intentionally client-exposed"); `03-architecture-shape.md:57` (auth gap means `anon` role is the effective role for all requests)
- Potential improvement: Tighten RLS `SELECT` policies to scope rows by `auth.uid()` or a department predicate once real auth is wired. Until auth is live, add `USING (false)` guards on write policies to prevent any anon writes. Cross-reference with the STRIDE audit (commit 3585746) for the full policy change list.
- Customer-value signal: risk reduction
- Value: high
- Effort hint: low
- Risk if untouched: Full dataset (users, kudos, awards) is read-accessible to anyone who obtains the published anon key. The anon key is intentionally exposed via `NEXT_PUBLIC_SUPABASE_ANON_KEY`, so this is not a key-rotation problem — it is a policy-scoping problem.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: `esbuild@0.21.5` is a known-vulnerable version. The dev server accepts cross-origin requests, allowing any website to read build responses. Fixed in 0.25.0.
- Evidence: `06-security-compliance.md:13` — `esbuild@0.21.5` → GHSA-67mh-4wv8-2f99 [CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N]; `package-lock.json:4789`; `06-security-compliance.md:28` — fix available at `esbuild@0.25.0`
- Potential improvement: Bump `esbuild` to ≥ 0.25.0. As a transitive devDependency of Vite/Next/other tooling, an `overrides` entry in `package.json` may be needed: `"overrides": { "esbuild": ">=0.25.0" }`. Risk is dev-only since it is not shipped to production, but any developer running `next dev` on a shared network is exposed.
- Customer-value signal: risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Developers running the local dev server on shared or semi-trusted networks (office Wi-Fi, remote) expose in-flight build artifacts to cross-origin reads. GHSA-67mh-4wv8-2f99 remains unmitigated.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: No automated dependency-vulnerability tooling is configured. There is no Dependabot, Renovate, Snyk, `npm audit` CI step, or any equivalent scanner. The single security artifact is a manual one-time audit (commit 3585746).
- Evidence: `06-security-compliance.md:47` — "no `.github/dependabot.yml`, `renovate.json`, `.snyk`, GitHub Actions workflows, or CI invocations of `npm audit` / `trivy` / `grype` / `osv-scanner` found"; `06-security-compliance.md:48` — "manual audit only, no automated tooling"
- Potential improvement: Add `dependabot.yml` (GitHub native, zero-cost) for weekly npm PR creation, and add an `npm audit --audit-level=high` step to the CI pipeline (when one is created). For the Terraform stack, add `trivy config infra/` or `checkov` scan. Low effort, high ongoing value.
- Customer-value signal: operational efficiency
- Value: medium
- Effort hint: low
- Risk if untouched: New CVEs accumulate silently. The next known-bad dependency will only be discovered by another manual audit, likely after the vulnerability is publicly exploited.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: 13 loose `^` ranges in `package.json` create reproducibility gaps. The lockfile pins current resolutions, but a `npm install --legacy-peer-deps` or CI cache miss can silently pull in a newer minor/patch that introduces a regression or vulnerability.
- Evidence: `06-security-compliance.md:75` — "13 occurrences of `^` prefix; 3 in dependencies + 10 in devDependencies"; `package.json:14,15,17,22-32`
- Potential improvement: Pin exact versions (remove `^`) for the 3 production dependencies (`@supabase/ssr`, `@supabase/supabase-js`, `next-intl`) and rely on Dependabot PRs for controlled upgrades. DevDependencies can stay loose. Exact-pin strategy is already applied to `next` and `eslint-config-next` (`package.json:16,28`), so the pattern is established.
- Customer-value signal: operational efficiency
- Value: low
- Effort hint: low
- Risk if untouched: A transitive semver-compatible bump in a production dependency can silently alter runtime behavior. Low immediate risk given the lockfile, but non-zero if the lock is ever regenerated.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: No `LICENSE` file exists at the repository root. For an internal project with MIT-licensed dependencies this is low urgency, but absence blocks any future open-sourcing or cross-team distribution and is inconsistent with enterprise IP governance.
- Evidence: `06-security-compliance.md:61` — "`LICENSE` presence: no — no `LICENSE` file at repository root"
- Potential improvement: Add a `LICENSE` file (MIT for OSS alignment, or a proprietary internal-use notice per Sun* IP policy). Single-file addition, no code changes.
- Customer-value signal: compliance
- Value: low
- Effort hint: low
- Risk if untouched: Licensing ambiguity if the repo is ever shared beyond the immediate team. No immediate operational risk for a private internal tool.

---

- Status: opportunity
- Category: security-and-dependencies
- Observation: Seven third-party packages with `hasInstallScript: true` (postinstall hooks) are present in the lockfile. None are application logic packages, but install scripts execute arbitrary code during `npm install` and are a supply-chain attack vector.
- Evidence: `06-security-compliance.json` → `06-security-compliance.md:79` — "`@parcel/watcher`, `esbuild`, `fsevents` (×2), `next-intl/node_modules/@swc/core`, `sharp`, `unrs-resolver`; `package-lock.json:1659,4794,5425,6940,7343,7780,8522`"
- Potential improvement: Document the 7 expected install-script packages in a `SECURITY.md` or `.npmrc` commentary. Consider `npm install --ignore-scripts` in CI followed by a post-install allowlist check (e.g., `is-ci` guard). No package removals needed — all are legitimate native add-ons.
- Customer-value signal: risk reduction
- Value: low
- Effort hint: low
- Risk if untouched: If any of the 7 packages is compromised in a supply-chain event, the attack executes silently on every `npm install`. Current risk is low (all are well-maintained); documenting the allowlist reduces future false-negative triage time.

---

- Status: needs-more-discovery
- Category: security-and-dependencies
- Observation: Terraform provider versions and IaC resource configurations have not been scanned against known-bad provider CVEs or misconfigurations. The HCL ecosystem is outside OSV npm scope and requires separate tooling.
- Evidence: `06-security-compliance.md:43-44` — "HCL/Terraform: requires `terraform providers lock` + `trivy config` or `checkov` scan"; `infra/modules/*/versions.tf`, `infra/envs/*/versions.tf`
- Potential improvement: Run `trivy config infra/` or `checkov --directory infra/` to surface IAM over-permission, open security groups, or unencrypted S3 buckets. The STRIDE audit (commit 3585746) covers app-layer threats but not IaC misconfiguration.
- Customer-value signal: risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: IaC misconfigurations (open SGs, missing encryption, over-broad IAM) in the AWS stack remain undetected. Status is `needs-more-discovery` pending tooling execution.
