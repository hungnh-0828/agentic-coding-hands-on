# Plan — Homepage SAA + Supabase Local

**Date:** 2026-05-26
**Source:** [Homepage SAA on MoMorph](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM) (screenId: `i87tDx10uM`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Stack:** Next.js 16.2.6 (App Router, Turbopack) · React 19.2.4 · TypeScript 5 · Tailwind v4 · Supabase (local) · next-intl

## Goal
Pixel-accurate Sun* Annual Awards 2025 homepage with Supabase-backed data (awards, notifications) and VN/EN i18n. Authentication is UI-only (stubbed state) in this session.

## Phases

| # | Phase | Status | Depends on |
|---|-------|--------|------------|
| 01 | Setup Supabase local + env | ✅ done | — |
| 02 | Database schema + seed (users, awards, notifications) + RLS | ✅ done | 01 |
| 03 | next-intl + Tailwind theme + design tokens | ✅ done | — |
| 04 | Layout shell + components (header, hero, awards, kudos, footer, widget) | ✅ done | 03 |
| 05 | Wire Supabase data into UI (awards, notification badge) | ✅ done | 02, 04 |
| 06 | Placeholder routes (Awards Information, Sun* Kudos, About SAA 2025, Admin Dashboard, /login) | ✅ done | 03 |
| 07 | Mock auth context + role-aware UI | ✅ done | 04 |

**Verified:** `npm run build` clean · `GET /vi` returns 200 with seeded awards (Top Talent, MVP...) + countdown · `GET /en` 200 · `GET /vi/awards-information` 200 · Supabase serves 6 awards + 2 unread notifications via REST.

**Review:** [reviewer-260526-1342-home-page-saa.md](../../reports/reviewer-260526-1342-home-page-saa.md) — verdict APPROVE_WITH_FIXES (8.2/10 → effective higher post-fixes).

**Post-review fixes applied:**
1. **Hydration mismatch** (CountdownTimer) — fixed via `useState<number|null>(null)` + useEffect
2. **Missing RLS** — added `0002_rls_policies.sql` (permissive policies for demo)
3. **Locale loss in award links** — switched to next-intl `Link`
4. **Mock auth in production** — gated behind `process.env.NODE_ENV === "development"`
5. **Hardcoded strings** — moved widget labels + notifications + login title to `messages/`

**Next.js 16 note:** Renamed `middleware.ts` → `proxy.ts` per deprecation warning.

## Key constraints

- **Next.js 16 breaking changes** — verify against `node_modules/next/dist/docs/` before using App Router APIs
- File size ≤ 200 lines per file (split aggressively)
- Kebab-case file naming
- All `app/` routes under `[locale]` segment (next-intl)

## Architecture

```
app/
├── [locale]/
│   ├── layout.tsx              # i18n provider, fonts, metadata
│   ├── page.tsx                # Home: composes sections
│   ├── awards-information/page.tsx       (placeholder)
│   ├── sun-kudos/page.tsx                (placeholder)
│   ├── about-saa-2025/page.tsx           (placeholder)
│   ├── admin-dashboard/page.tsx          (placeholder)
│   └── login/page.tsx                    (placeholder)
├── globals.css                 # Tailwind v4 + theme tokens
└── components/
    ├── header/
    │   ├── site-header.tsx
    │   ├── nav-link.tsx
    │   ├── notification-bell.tsx
    │   ├── language-switcher.tsx
    │   └── account-menu.tsx
    ├── hero/
    │   ├── hero-section.tsx
    │   ├── countdown-timer.tsx
    │   └── event-info.tsx
    ├── root-further-content.tsx
    ├── awards/
    │   ├── awards-section.tsx
    │   └── award-card.tsx
    ├── sun-kudos-section.tsx
    ├── site-footer.tsx
    └── widget-button.tsx

lib/
├── supabase/
│   ├── client.ts               # Browser client
│   └── server.ts               # Server client (RSC)
├── auth/
│   └── mock-auth-context.tsx   # UI-only isAuthenticated + role
└── i18n/
    ├── request.ts              # next-intl request config
    └── routing.ts              # next-intl routing config

messages/
├── vi.json
└── en.json

supabase/
├── config.toml                 # supabase init output
├── migrations/
│   ├── 0001_initial_schema.sql # users + awards + notifications tables
│   └── 0002_rls_policies.sql   # permissive RLS for demo
└── seed.sql                    # 6 awards + sample notifications
```

## Data flow

```
Supabase Local (port 54321)
       │
       ├── awards table  ────► RSC fetches in [locale]/page.tsx ────► AwardsSection
       │                                                              └─► AwardCard × 6
       │
       └── notifications table ─► RSC reads unread count ──► NotificationBell badge
                                  (mock user_id since auth is stubbed)
```

## Success criteria

- `npm run dev` shows pixel-accurate homepage at `/` (redirects → `/vi`)
- 6 award cards rendered from Supabase `awards` table
- Notification bell shows badge based on Supabase `notifications` unread count
- Language switcher works (`/vi` ↔ `/en`); content translated
- Countdown reads `NEXT_PUBLIC_EVENT_DATETIME`, fallback `2025-12-31T18:30:00+07:00`
- Placeholder routes resolve (no 404)
- `npm run build` succeeds
- `npx tsc --noEmit` clean

## Out of scope (explicit)

- Real Supabase Auth flow (UI-only mock instead)
- Awards Information / Sun* Kudos / Admin Dashboard content (placeholder only)
- Notification panel content (button opens nothing visible)
- Widget button quick action menu items
- Visual regression / E2E tests
- Production Supabase config
