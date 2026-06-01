# Platform Support — agentic-coding-hands-on (saa-2025)
**Use context:** internal

- **Client delivery modes:**
  - Web app: SSR + RSC (Next.js 16 App Router with server components and server actions) — `next.config.ts:1`, `package.json:14`
  - Mobile: (none detected)
  - Desktop: (none detected)
  - CLI: (none detected) — no `bin` field in `package.json`
  - Public API or SDK: (none detected) — no OpenAPI spec or SDK package found
- **Deployment modes:**
  - Self-hosted / on-premise: Terraform (AWS ECS Fargate + ALB + Aurora + S3 + Lambda, 3 envs) — `infra/envs/dev/main.tf:1`, `infra/modules/ecs/main.tf:1`
  - Cloud-managed SaaS: Vercel — `.vercel/project.json:1` (`projectId: prj_Kf4dQE1YdRpiXs7ipVotAnNaf4oB`, `projectName: saa-2025`); no `vercel.json` config file at repo root
  - Serverless: AWS Lambda (Terraform module) — `infra/modules/lambda/main.tf:1`; no Cloudflare Workers or GCP Cloud Functions detected
  - PaaS: (none detected) — no `Procfile` found
  - Multi-tenant / single-tenant signals: single-tenant signals only — no tenant-scoping in DB schema or RLS policies; `supabase/migrations/0002_rls_policies.sql` grants read-all to anon/auth with no org/tenant column partitioning (`supabase/migrations/0002_rls_policies.sql:1`)
- **OS / runtime matrix:** (none) — no `.github/workflows/` CI files present; no `strategy.matrix.os`; no root Dockerfile (ECS Fargate infra references ECR but no app Dockerfile at repo root); no README OS badge

<!-- Supplementary signals -->
- **Responsive / CSS:** Tailwind CSS v4 — `package.json:27` (`"tailwindcss": "^4"`); `postcss.config.mjs:1`
- **i18n locales:** `vi` (default) + `en` — `lib/i18n/routing.ts:3-6` (`locales: ["vi", "en"]`, `defaultLocale: "vi"`)
- **Browser test target:** Chromium only (`Desktop Chrome` device profile) — `playwright.config.ts:16` (`projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]`)
- **Image remote patterns:** `i.pravatar.cc` + `picsum.photos` (demo/seed avatars and kudos thumbnails) — `next.config.ts:12-15`
- **PWA manifest:** (none detected) — no `manifest.json`, `manifest.webmanifest`, or `sw.js` in `public/`
- **Deployment target divergence:** `.vercel/` directory present (active Vercel project) alongside Terraform AWS ECS/Fargate infra — two concurrent deployment targets, relationship unresolved (`scout-report.md:150`)
