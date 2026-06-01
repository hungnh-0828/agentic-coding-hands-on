# Sun* Annual Awards 2025 (SAA 2025)

Bilingual (Vietnamese default / English) event site for the Sun* Annual Awards 2025, themed **ROOT FURTHER**. The centrepiece feature is **Sun* Kudos** — a social-recognition live board where attendees send, like, and browse peer kudos in real time during the event.

## Key Features

- Bilingual UI (vi / en) with next-intl; locale prefix always present in URL
- Home page: hero banner, ROOT FURTHER narrative, awards grid, kudos preview
- Sun* Kudos live board: send kudos, highlight carousel, spotlight, all-kudos feed, sidebar stats, compose modal
- Awards information: detail blocks with alternating layout and sidebar nav
- Prelaunch: full-screen LED countdown to event
- AuthGuard-gated pages; mock Google OAuth (real Supabase Auth wired later)
- AWS Terraform IaC (VPC, Aurora, ECS Fargate, ALB, S3, Lambda) for production infra

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.6 (App Router) |
| UI | React 19.2.4, Tailwind CSS 4, Geist + Montserrat fonts |
| i18n | next-intl 4.12 |
| Database / Auth | Supabase (supabase-js 2.106.2, @supabase/ssr 0.10.3) |
| Language | TypeScript 5 (strict) |
| Unit tests | Vitest 2.1.9 |
| E2E tests | Playwright 1.60 (Chromium) |
| Infra IaC | Terraform (AWS, ap-southeast-1) |

## Prerequisites

- Node.js 20+
- A Supabase project (URL + anon key)
- (Optional) Terraform 1.x for infra provisioning

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local and fill in:
#   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# 3. Apply database migrations (requires Supabase CLI)
supabase db push

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/vi` (default locale).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests (requires `npx playwright install chromium` once) |

## Project Structure

```
.
├── app/[locale]/          # Next.js App Router — one dir per route
├── components/            # ~44 TSX components grouped by feature
├── lib/                   # Data layer (supabase, auth, kudos, i18n, event)
├── messages/              # i18n JSON files (vi.json, en.json)
├── supabase/              # Migrations (0001–0006) and seed.sql
├── infra/                 # Terraform modules + dev/staging/prod envs
├── e2e/                   # Playwright specs
├── docs/                  # Project documentation
└── public/                # Static assets
```

## Documentation

| Document | Description |
|----------|-------------|
| [docs/codebase-summary.md](docs/codebase-summary.md) | Navigational map of the repo — where to find things |
| [docs/system-architecture.md](docs/system-architecture.md) | App architecture + AWS infra (Terraform) |
| [docs/project-changelog.md](docs/project-changelog.md) | Changelog of notable changes |
| [docs/infra-cost-breakdown.md](docs/infra-cost-breakdown.md) | AWS cost estimates per environment |
