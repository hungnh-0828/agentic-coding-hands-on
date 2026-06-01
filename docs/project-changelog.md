# Project Changelog

All notable changes to SAA 2025 are recorded here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); dates are `YYYY-MM-DD`.

## 2026-06-01

### Infrastructure
- **AWS Terraform IaC stack** — full production infrastructure under `infra/`:
  reusable modules (vpc, security-groups, aurora, alb, ecs, s3, lambda) composed
  per environment under `infra/envs/{dev,staging,prod}/`. Region ap-southeast-1.
  Aurora PostgreSQL 17.7, ECS Fargate, ALB with TLS, S3 (versioned + SSE),
  VPC-attached worker Lambda. State stored in S3 + DynamoDB locking per env.

### Documentation
- **README.md rewrite** — replaced create-next-app boilerplate with real project
  description, feature list, tech stack table, prerequisites, getting started
  steps, scripts table, project structure overview, and docs pointers.
- **docs/system-architecture.md — Application Architecture section** — prepended
  app-level architecture: route map, server/client boundary pattern, data layer
  (Supabase clients, 8 tables, key queries/actions, DRY validation), i18n setup,
  auth model, and request-flow Mermaid diagram. AWS infra section unchanged.
- **docs/codebase-summary.md** (new) — navigational map: top-level directory
  table, lib/ module breakdown, component-group inventory, DB schema summary
  (8 tables + migration history), testing layout (Vitest + Playwright), and key
  conventions reference.

### Added
- **Playwright E2E suite** — 14 tests across 3 spec files (`navigation.spec.ts`,
  `auth.spec.ts`, `kudos.spec.ts`). Config boots `next dev` via `webServer`,
  warms all routes in `globalSetup`, retries once on flake. Chromium only.
  Run with `npm run test:e2e` (requires `npx playwright install chromium` once).
- **Unit test suite expansion** — 134 new tests across 5 files (event handlers,
  i18n routing, i18n request, kudos queries, kudos actions); all passing.
- **Vitest `@/` alias** — added `resolve.alias` in `vitest.config.ts` to mirror
  `tsconfig` path mapping so tests resolve `@/` imports correctly.

## 2026-05-29

### Fixed
- **Kudos live board — Figma design alignment** (`fix/ui.kudos-list`). Rebuilt
  `/sun-kudos` to match the MoMorph design and added the data it needs:
  - Banner KUDOS wordmark hero; cream kudos cards (sender/receiver, Hero badges,
    sent icon, title, content sub-box, image gallery, red hashtags, like + copy link).
  - Highlight peek-carousel with circular arrows + pager; dark spotlight canvas with
    centered count + name cloud; sidebar avatar lists with gold names + "Mở Secret Box".
  - Send bar gains a visual profile-search field.
  - Data: `users.avatar_url` (migration `0006`), seeded avatars + kudos `image_urls`
    + badge-variety filler; Hero badge/star derived from received-kudos count
    (10 → 1★ Rising, 20 → 2★ Super, 50 → 3★ Legend).
  - Config: `next.config` allows `i.pravatar.cc` / `picsum.photos` remote images.
  - i18n: badge labels, profile-search placeholder, edit/detail strings.
  - Tests: added `hero-badge` unit tests (badge thresholds). Suite 66/66.
  - **Migration note:** non-local environments must apply migration `0006` + reseed.
  - **Follow-up:** paginate the All-Kudos feed (seed now yields ~80 cards).
- **Prelaunch countdown** screen aligned with Figma design (#10).
- **Awards system** screen aligned with Figma design + active nav highlight (#9).
- **Homepage** UI aligned with Figma design (#8).
- **Login** screen aligned with Figma design (#7).

## 2026-05-27

### Added
- **Compose Kudo modal** ("Viết Kudo") — recipient picker, hashtag/image inputs,
  anonymous option, validation (#6).

## 2026-05-26

### Added
- **Sun\* Kudos live board** — banner, highlight carousel, spotlight, all-kudos feed,
  sidebar, like toggle + hashtag/department filters (#5).
- **Prelaunch** full-screen countdown page with LED digit variant (#4).
- **Awards information** page + client auth guard (#3).
- **Login** screen — mock Google OAuth, bilingual (vi/en) content (#2).
