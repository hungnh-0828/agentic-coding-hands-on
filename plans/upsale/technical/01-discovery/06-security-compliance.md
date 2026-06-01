# Security & Compliance Surface — agentic-coding-hands-on
**Use context:** internal

<!-- CVE lookup uses the OSV.dev API (https://api.osv.dev/v1/querybatch) as the
     authoritative source for advisory IDs. Cite exact `path:line` from a lockfile/manifest.
     If OSV is unreachable, mark entries `needs-network-verify` and use the fallback shape.
     NEVER invent CVE/GHSA IDs — every ID MUST come from an OSV response. -->

## Known-bad version flags

<!-- Source: OSV.dev /v1/querybatch — queried 2026-06-01. OSV API reachable; IDs verbatim from response. -->

- **npm:** `esbuild@0.21.5` → GHSA-67mh-4wv8-2f99 [CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N] — esbuild dev server accepts cross-origin requests; any website can read responses (`package-lock.json:4789`)
- **npm:** `postcss@8.5.15` → GHSA-qx2v-qp2m-jg93 [CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N] — OSV flags range `<8.5.10`; pinned version 8.5.15 is **at or above the fix boundary** (`package-lock.json:7369`) — `osv-api: returned advisory for this version range; pinned version is patched`

> Note: `esbuild` is a devDependency (build-time only, not shipped to prod). `postcss@8.5.15` is already patched (fixed ≥ 8.5.10).
> All other queried direct deps (`next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`, `next-intl`, `eslint`, `typescript`, `vitest`, `@playwright/test`, `tailwindcss`, `supabase`, `sharp`, `@parcel/watcher`) returned CLEAN from OSV.

## Outdated dependencies — major-version drift

<!-- Top direct deps (package.json + lockfile-pinned). "Latest" claims from model knowledge cutoff August 2025; tag needs-network-verify where appropriate. -->

- **npm:** `next`: 16.2.6 → ≈15 (`needs-network-verify` — version 16 post-dates model training; no known stable 17.x) (`package.json:16`)
- **npm:** `react`: 19.2.4 → ≈19 (current major; no drift) (`package.json:18`)
- **npm:** `@supabase/supabase-js`: 2.106.2 → ≈2 (current major; minor-drift possible) (`package.json:15`, `package-lock.json`)
- **npm:** `@supabase/ssr`: 0.10.3 → ≈0.x (`needs-network-verify` — sub-1.0, patch drift possible) (`package.json:14`)
- **npm:** `next-intl`: 4.12.0 → ≈4 (current major) (`package.json:17`)
- **npm:** `esbuild`: 0.21.5 → ≈0.25 (minor-drift; fix for GHSA-67mh-4wv8-2f99 at 0.25.0) (`package-lock.json:4789`)
- **npm:** `tailwindcss`: ^4 pinned 4.3.0 → ≈4 (current major) (`package.json:30`)
- **npm:** `typescript`: ^5 pinned 5.9.3 → ≈5 (current major) (`package.json:31`)
- **npm:** `@playwright/test`: ^1.60.0 → ≈1.x (`needs-network-verify` — latest 1.x may be ahead) (`package.json:22`)
- **npm:** `vitest`: ^2.1.9 → ≈2.x (minor-drift possible) (`package.json:32`)
- **npm:** `supabase` (CLI): ^2.101.0 → ≈2.x (minor-drift possible) (`package.json:29`)

## Runtime / framework EOL

- **Node.js 24.11.1** — Node 24 is current active LTS line (2026-06-01); not EOL. (runtime env, no manifest pin)
- **Next.js 16.2.6** — Next.js 16 post-dates model training cutoff (`needs-network-verify` for EOL status); Next.js 13 and below are EOL. (`package.json:16`)
- **React 19.2.4** — React 19 is current stable; not EOL. (`package.json:18`)

## Unscannable ecosystems

- **HCL/Terraform:** manifests at `infra/modules/*/versions.tf`, `infra/envs/*/versions.tf` — Terraform provider CVE/outdated evaluation not covered by OSV npm ecosystem; requires `terraform providers lock` + `trivy config` or `checkov` scan.

## Dependency-vulnerability tooling presence

- `no vulnerability tooling configured` — no `.github/dependabot.yml`, `renovate.json`, `.snyk`, GitHub Actions workflows, or CI invocations of `npm audit` / `trivy` / `grype` / `osv-scanner` found in project root.
- Existing security review: `plans/reports/security-audit-260601-1019-app-and-infra.md` (STRIDE/OWASP audit, commit 3585746, 2026-06-01) — manual audit only, no automated tooling.

## Secret-management posture

- `.env` files committed: **no** — `.gitignore:33-34` patterns `.env*` exclude all `.env.*` from tracking; `git ls-files` confirms `.env.local` is untracked.
- `.env.local` present on disk (untracked): variable classes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_EVENT_DATETIME` (`.env.local:1-3`). Values never quoted.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are intentionally client-exposed (Supabase anon key design pattern) (`lib/supabase/client.ts`).
- Env-loading libraries: none explicit in `package.json`; Next.js built-in `.env` loader used.
- Secret-manager references: **AWS Secrets Manager** — Aurora DB master password generated and stored via `aws_secretsmanager_secret` + `aws_secretsmanager_secret_version` (`infra/modules/aurora/main.tf:21,29,30`); secret ARN exported (`infra/modules/aurora/outputs.tf:26`).
- Supabase `config.toml` uses `env(...)` references for all sensitive values (OPENAI_API_KEY, SENDGRID_API_KEY, Twilio auth token, S3 keys, etc.) (`supabase/config.toml:95,237,289,394-400`). No secrets hardcoded.

## License manifest

- `LICENSE` presence: **no** — no `LICENSE` file at repository root.
- Top-dep licenses (from `package-lock.json`):
  - `next@16.2.6` → MIT
  - `react@19.2.4` → MIT
  - `react-dom@19.2.4` → MIT
  - `@supabase/supabase-js@2.106.2` → MIT
  - `@supabase/ssr@0.10.3` → MIT
  - `next-intl@4.12.0` → MIT
  - `tailwindcss@4.3.0` → MIT
  - `eslint@9.39.4` → MIT
  - `typescript@5.9.3` → Apache-2.0

## Supply-chain hygiene

- Unpinned/loose ranges: **13** occurrences in `package.json` (all `^` prefix). 3 in `dependencies` (`@supabase/ssr`, `@supabase/supabase-js`, `next-intl`) + 10 in `devDependencies`. Lockfile pins all resolutions. (`package.json:14,15,17,22-32`)
- `next@16.2.6` and `eslint-config-next@16.2.6` are exact-pinned (no `^`). (`package.json:16,28`)
- Git-ref / tarball / local-path installs: **0** — no `file:`, `link:`, or `git+` entries in `package.json`.
- Pre-release versions in production manifests: **0** — no `-alpha`, `-rc`, `-next`, `0.0.0-*` in `package.json` dependencies.
- Third-party `hasInstallScript: true` packages in lockfile: **7** — `@parcel/watcher`, `esbuild`, `fsevents` (×2, via `next` and `playwright`), `next-intl/node_modules/@swc/core`, `sharp`, `unrs-resolver` (`package-lock.json:1659,4794,5425,6940,7343,7780,8522`). All are native add-ons / build tools; none are application logic packages.

<!-- Total length under 300 lines. Snapshot only — no narration. -->
