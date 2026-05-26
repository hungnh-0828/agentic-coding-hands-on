# Plan — Awards Information page (Hệ thống giải)

**Date:** 2026-05-26
**Source:** [Hệ thống giải on MoMorph](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD) (screenId: `zFYDgyj_pD`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Builds on:** `6844b4b` (homepage + Supabase) + `92fee7d` (login)

## Goal
Replace placeholder `/awards-information` route with the MoMorph "Hệ thống giải thưởng SAA 2025" design — keyvisual banner, section title, sticky left nav (scroll-spy + hash sync), 6 award detail blocks (image + description + prize count/unit/value), Sun* Kudos promo at bottom. Authenticated-only (client-side guard → /login redirect for unauthed).

## Phases (sequential)

| # | Phase | Status |
|---|-------|--------|
| 01 | Plan + clarifications | ✅ done |
| 02 | Migration 0003 (add prize columns) + seed update + db reset | ✅ done |
| 03 | Update `lib/supabase/types.ts` for new columns | ✅ done |
| 04 | i18n keys (vi + en) | ✅ done |
| 05 | UI components (banner, header, nav with scroll-spy, detail block, auth-guard) | ✅ done |
| 06 | Replace placeholder `/awards-information/page.tsx` | ✅ done |
| 07 | Build verify + curl test | ✅ done |
| 08 | Reviewer + fixes | ✅ done |
| 09 | Deliver (project-manager + doc-writer + git-manager) | pending |

## Architecture

```
app/[locale]/awards-information/page.tsx       # Server: fetch awards from DB, compose layout
components/awards-information/
├── awards-information-banner.tsx              # Keyvisual hero (ROOT FURTHER + subtitle)
├── awards-information-header.tsx              # Section title (caption + yellow title)
├── awards-information-nav.tsx                 # CLIENT — sticky left menu, scroll-spy + hash sync
├── award-detail-block.tsx                     # Per-award: image + title + desc + prize info
└── (Sun* Kudos reuses existing components/sun-kudos-section.tsx)

lib/auth/auth-guard.tsx                        # CLIENT — redirect-to-login wrapper for protected routes

supabase/migrations/0003_award_prize_fields.sql # ALTER awards ADD prize_count, unit_label, prize_value
supabase/seed.sql                              # Update with prize data + longer descriptions

messages/{vi,en}.json                          # New `awardsInfo.*` namespace
```

## Data flow

```
Auth gate (client):
  /awards-information rendered (header + footer always)
  AuthGuard wraps main content → reads MockAuthContext
    │
    ├── authenticated: render full page content (banner + nav + 6 blocks + kudos)
    └── unauthenticated: useEffect → router.replace('/login') + "Đang chuyển hướng..."

Data flow:
  awardsRouteServer fetches all awards from Supabase (with new prize fields)
  passes awards[] as prop to AwardsContent client wrapper
  AwardsContent renders nav + detail blocks
  Nav uses IntersectionObserver for scroll-spy + history.replaceState for hash
```

## Schema delta (migration 0003)

```sql
alter table public.awards
  add column prize_count int,
  add column unit_label text,
  add column prize_value text;
```

Seed updates (lines for 6 awards):

| slug | prize_count | unit_label | prize_value |
|------|-------------|------------|-------------|
| top-talent | 10 | Đơn vị | 7.000.000 VNĐ |
| top-project | 02 | Tập thể | 15.000.000 VNĐ |
| top-project-leader | 03 | Cá nhân | 7.000.000 VNĐ |
| best-manager | 01 | Cá nhân | 10.000.000 VNĐ |
| signature-creator | 01 | (null) | 5.000.000 VNĐ (cá nhân) / 8.000.000 VNĐ (tập thể) |
| mvp | 01 | (null) | 15.000.000 VNĐ |

## Success criteria
- `npm run build` clean
- `GET /vi/awards-information` while signed-in: 200, all 6 sections render with prize data
- `GET /vi/awards-information` while signed-out: redirect to `/vi/login`
- Click left nav item: smooth scroll to section + active highlight + URL hash updates
- Manual scroll: nav active state follows visible section
- Deep link `/vi/awards-information#mvp` scrolls to MVP section on load
- Sun* Kudos "Chi tiết" → navigates to `/sun-kudos`

## Out of scope
- Real award images (placeholder gradients)
- Server-side auth gate (UI-only mock context)
- Animations beyond simple scroll behavior
- E2E tests

## Review fixes applied

**Report:** [reviewer-260526-1514-awards-information.md](../reports/reviewer-260526-1514-awards-information.md) (8/10 APPROVE_WITH_FIXES)

Fixes post-review:
1. **H1** `aria-current="true"` → `"location"` (valid ARIA token for nav links)
2. **H2** `history.replaceState` → `window.history.replaceState` (SSR safety)
3. **M3** Added `scrollTimerRef` + `clearTimeout` on re-click race (prevents observer leakage)
4. **M1** Prize count `<dd>x2` → single `<dd>` with embedded unit (semantic dl)
5. **M5** `AwardRow` type → `Pick<Database["public"]["Tables"]["awards"]["Row"], ...>` (drift prevention)
6. **N3** Hardcoded English `aria-label` → `t("title") + " — " + t("subtitle")` (bilingual)
7. **Build fix:** `window.setTimeout` typed to `number` → bare `setTimeout` (ref type match)
