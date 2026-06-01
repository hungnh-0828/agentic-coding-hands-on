# Codebase Summary

Navigational map of the SAA 2025 repo — "where do I find X?"

## Top-Level Directories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — layouts, pages, and route groups under `app/[locale]/` |
| `components/` | ~44 TSX components, grouped by feature (see below) |
| `lib/` | Data layer, auth, i18n helpers, and utility modules |
| `messages/` | i18n JSON files: `vi.json` (default) and `en.json` |
| `supabase/` | DB migrations (`migrations/`) and `seed.sql` |
| `infra/` | Terraform IaC — `modules/` + `envs/{dev,staging,prod}/` |
| `e2e/` | Playwright E2E test specs |
| `docs/` | Project documentation (you are here) |
| `plans/` | Implementation plans and agent reports |
| `public/` | Static assets served at root |

## lib/ Module Breakdown

| Module | Files | Responsibility |
|--------|-------|----------------|
| `lib/supabase/` | `client.ts`, `server.ts`, `types.ts` | Supabase browser/server clients; generated DB types |
| `lib/auth/` | `mock-auth-context.tsx`, `auth-guard.tsx` | Mock auth context (client); route guard redirecting to /login |
| `lib/kudos/` | `queries.ts`, `actions.ts`, `compose-validation.ts`, `hero-badge.ts` | Kudos data fetch, Server Actions, shared validation, badge thresholds |
| `lib/i18n/` | `routing.ts`, `request.ts`, `navigation.ts` | Locale config, request config (loads messages JSON), typed navigation helpers |
| `lib/event.ts` | — | `getEventISO()` — returns event date/time for the prelaunch countdown |

## Component Groups

| Group (dir under `components/`) | Key components |
|--------------------------------|---------------|
| `hero/` | `hero-section`, `countdown-timer`, `event-info` |
| `awards/` | `awards-section`, `award-card` |
| `awards-information/` | `banner`, `header`, `nav`, `award-detail-block` |
| `header/` | `site-header`, `nav-link`, `notification-bell`, `language-switcher`, `account-menu` |
| `login/` | `login-header`, `login-hero`, `login-form`, `login-language-switcher` |
| `kudos/` | `kudos-board-context`, `all-kudos-section`, `highlight-section`, `spotlight-board`, `kudos-banner`, `send-kudos-input`, `kudos-sidebar`, `kudos-card`, `like-button`, `hero-badge`, `person-block`, `copy-link-button`, `kudos-filters`, `kudos-image-gallery`, `kudos-toast` |
| `kudos/compose/` | `compose-kudo-modal`, `compose-kudo-form`, `use-compose-form`, `recipient-select`, `hashtag-picker`, `kudo-editor`, `image-uploader`, `compose-modal-context` |
| Root components | `root-further-content`, `site-footer`, `sun-kudos-section`, `widget-button` |

## Database Schema

8 tables across 6 migrations (`supabase/migrations/`):

| Table | One-liner |
|-------|-----------|
| `users` | Platform users; role (regular\|admin), department link, avatar URL |
| `departments` | Company departments; linked to users |
| `hashtags` | Kudos hashtag taxonomy (slug + display label) |
| `awards` | Award definitions: slug, title, prize_count, unit_label, prize_value, display_order |
| `notifications` | Per-user notification inbox with `read_at` timestamp |
| `kudos` | Kudos posts: sender, receiver (sender ≠ receiver constraint), title, content, anonymous flag, image URLs |
| `kudos_hashtags` | M:N join between kudos and hashtags |
| `kudos_likes` | Per-user kudos likes with weight (1 or 2) |

**Migration history:**

| Migration | Changes |
|-----------|---------|
| `0001` | Initial schema: users, awards, notifications |
| `0002` | RLS policies (permissive demo) |
| `0003` | Award prize fields (prize_count, unit_label, prize_value) |
| `0004` | Kudos schema |
| `0005` | Compose kudos columns (is_anonymous, anonymous_name, image_urls) |
| `0006` | Kudos avatars (users.avatar_url) |

## Testing Layout

**Unit tests (Vitest):**

| Dir / file | Coverage area |
|-----------|--------------|
| `lib/event.test.ts` | Event date helpers |
| `lib/i18n/routing.test.ts` | i18n locale routing config |
| `lib/i18n/request.test.ts` | Request locale resolution |
| `lib/kudos/queries.test.ts` | fetchKudosBoard, fetchKudosStats |
| `lib/kudos/actions.test.ts` | toggleKudosLike, createKudos |
| `lib/kudos/hero-badge.test.ts` | Badge threshold logic |

Run: `npm run test` (Vitest in run mode)

**E2E tests (Playwright, Chromium):**

| Spec | Coverage area |
|------|--------------|
| `e2e/navigation.spec.ts` | Route navigation, locale switching |
| `e2e/auth.spec.ts` | Login / logout flows |
| `e2e/kudos.spec.ts` | Kudos board interactions |

Run: `npm run test:e2e` (boots `next dev` via webServer config; requires `npx playwright install chromium` once)

## Key Conventions

| Convention | Detail |
|-----------|--------|
| Next.js 16 async params | Route params typed as `Promise<{locale}>` — must `await` before use |
| Middleware | `proxy.ts` at repo root (not `middleware.ts`) — next-intl middleware, matches all routes except `/api`, `/_next`, `/_vercel`, static files |
| Server-first rendering | All components are RSC by default; `"use client"` only for interactivity |
| DRY validation | `lib/kudos/compose-validation.ts` exports both client and server validators from one source |
| Locale prefix | Always present in URL: `/vi/...` and `/en/...` |
| Static params | `generateStaticParams()` pre-renders both locales at build time |
| Image remotes | `next.config` allows `i.pravatar.cc` and `picsum.photos` for avatar/placeholder images |
| Tailwind theme vars | Custom CSS vars: `saa-bg`, `saa-accent`, `saa-muted`, `saa-text` |
