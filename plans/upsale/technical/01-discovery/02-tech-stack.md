# Tech Stack — agentic-coding-hands-on
**Use context:** internal

- **Frameworks:**
  - Next.js 16.2.6 (App Router, Turbopack) — `package.json:16` / `next.config.ts:1`
  - React 19.2.4 — `package.json:17`
  - react-dom 19.2.4 — `package.json:18`
  - next-intl 4.12.0 (i18n middleware + routing) — `package.json:15` / `lib/i18n/routing.ts`
  - @supabase/ssr 0.10.3 (server + browser client pattern) — `package.json:13` / `lib/supabase/client.ts:1` / `lib/supabase/server.ts:2`
  - @supabase/supabase-js 2.106.2 — `package.json:14`
  - Terraform >= 1.5 (IaC; AWS provider ~> 5.0, random ~> 3.6) — `infra/envs/dev/versions.tf:3`

- **Major libraries (17 direct deps; all direct deps listed — well under cap of 50):**
  - `next@16.2.6` — `package.json:16`
  - `react@19.2.4` — `package.json:17`
  - `react-dom@19.2.4` — `package.json:18`
  - `@supabase/ssr@0.10.3` — `package.json:13`
  - `@supabase/supabase-js@2.106.2` — `package.json:14`
  - `next-intl@4.12.0` — `package.json:15`
  - `tailwindcss@4.3.0` — `package.json:30` (resolved from `^4`)
  - `@tailwindcss/postcss@4.3.0` — `package.json:23` (resolved from `^4`)
  - `typescript@5.9.3` — `package.json:32` (resolved from `^5`)
  - `vitest@2.1.9` — `package.json:33`
  - `@playwright/test@1.60.0` — `package.json:22`
  - `eslint@9.39.4` — `package.json:27` (resolved from `^9`)
  - `eslint-config-next@16.2.6` — `package.json:28`
  - `supabase@2.101.0` (CLI, devDep) — `package.json:29`
  - `@types/node@20.19.41` — `package.json:24`
  - `@types/react@19.2.15` — `package.json:25`
  - `@types/react-dom@19.2.3` — `package.json:26`
  - Notable transitive: `@supabase/auth-js@2.106.2`, `postcss@8.5.15`, `zod@4.4.3`

- **Build tooling:**
  - Turbopack (Next.js built-in) — `next.config.ts:7` (`turbopack: { root: __dirname }`)
  - PostCSS + @tailwindcss/postcss — `postcss.config.mjs`
  - TypeScript compiler (tsc) — `tsconfig.json` (target: ES2017, strict: true, path alias `@/*` → `./`)
  - ESLint 9 flat config — `eslint.config.mjs`
  - Terraform CLI >= 1.5 — `infra/envs/dev/versions.tf:3`

- **Package manager + lockfile status:**
  - npm — manifest `package.json`, lockfile `package-lock.json` (lockfileVersion: 3)
  - No other ecosystems (Python/Go/Cargo/Maven absent in app stack; Terraform HCL manages its own provider versions via `versions.tf`)

- **Database(s) / caches / queues / search / object storage:**
  - Supabase (PostgreSQL) — application datastore; browser client `lib/supabase/client.ts:7-8`, server client `lib/supabase/server.ts:10-11`; schema migrations in `supabase/migrations/` (6 files)
  - Aurora PostgreSQL (engine: `aurora-postgresql`, engine_version default: `17.7`) — IaC target; `infra/modules/aurora/main.tf:44-45`, default declared `infra/modules/aurora/variables.tf:35`
  - AWS S3 — object storage for app assets; `infra/modules/s3/main.tf:6`
  - AWS Secrets Manager — DB credentials; `infra/modules/aurora/main.tf:22`
  - No Redis/ElastiCache, SQS, or search service detected

- **Runtime EOL judgement:**
  - Node.js: no `engines` field in `package.json`, no `.nvmrc`; runtime environment reports v24.11.1 (current LTS as of 2025 — SUPPORTED; Node 24 active LTS until ~Apr 2027)
  - Lambda runtime: `python3.14` — `infra/envs/dev/terraform.tfvars:32`; Python 3.14 (released Oct 2024) — SUPPORTED, EOL ~Oct 2029
  - No Go, JVM, or Rust runtimes detected

<!-- Total length under 400 lines. Snapshot only — no narration. -->
