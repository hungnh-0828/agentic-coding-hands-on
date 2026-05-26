# Plan — Sun* Kudos Live Board

**Date:** 2026-05-26
**Source:** [Sun* Kudos - Live board](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ) (screenId: `MaZUn5xHXZ`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Branch:** `feat/kudos-list`
**Builds on:** main HEAD (homepage + login + awards-info + prelaunch merged)

## Goal
Replace placeholder `/sun-kudos` route with full live-board: banner + send-input + Highlight carousel (top 5 by likes, filterable by hashtag/dept) + Spotlight word cloud + All Kudos feed + sidebar (user stats + recent prize recipients). Auth-required (client guard). Like toggle persists to DB via server action.

## Phases

| # | Phase | Status |
|---|-------|--------|
| 01 | Plan + clarifications | ✅ done |
| 02 | Migration 0004 (kudos schema) + seed | ✅ done |
| 03 | Update types.ts + i18n keys | ✅ done |
| 04 | Build kudos components (10 files) | ✅ done |
| 05 | Compose sun-kudos page | ✅ done |
| 06 | Server action for like toggle | ✅ done |
| 07 | Build verify + curl test | ✅ done |
| 08 | Reviewer + fixes | ✅ done |
| 09 | Deliver (pm + doc-writer + git-manager) | pending |

## Schema delta (migration 0004)

```sql
alter table users add column department_id uuid;

create table departments (id uuid PK, slug text unique, name text);
create table hashtags    (id uuid PK, slug text unique, label text);
create table kudos       (id uuid PK, sender_id uuid FK, receiver_id uuid FK, content text, created_at);
create table kudos_hashtags (kudos_id FK, hashtag_id FK, PK both);
create table kudos_likes (kudos_id FK, user_id FK, weight int default 1, PK both);
```

RLS: same permissive demo policy as previous tables.

## Architecture

```
app/[locale]/sun-kudos/page.tsx          # Server: AuthGuard wrap, fetch all data, compose

components/kudos/
├── kudos-banner.tsx                     # Hero with title + eyebrow
├── send-kudos-input.tsx                 # Pill input, click → toast (placeholder for dialog)
├── kudos-filters.tsx                    # CLIENT — hashtag + dept dropdowns, lifts state up
├── kudos-card.tsx                       # Shared card (sender/receiver/content/hashtags/likes)
├── highlight-carousel.tsx               # CLIENT — prev/next + active card emphasis
├── all-kudos-feed.tsx                   # Server — list of cards (filtered)
├── spotlight-board.tsx                  # Simplified word cloud (static names)
├── kudos-sidebar.tsx                    # Stats + recent prize list
├── like-button.tsx                      # CLIENT — toggle + persist via server action
└── copy-link-button.tsx                 # CLIENT — clipboard + toast

lib/kudos/
├── queries.ts                           # Server-side DB queries (list kudos, stats, filters)
└── actions.ts                           # 'use server' toggleKudosLike action

messages/{vi,en}.json                    # New kudos.* namespace
```

## Review Fixes Applied

**Report:** [`plans/reports/reviewer-260526-1631-kudos-list.md`](../reports/reviewer-260526-1631-kudos-list.md)

Reviewer approved with fixes (7.5/10). Corrections applied:
- **C1** Per-card `pending` Set (prevents double-click race)
- **C2** Server action insert/delete throws on error (no silent swallow)
- **C3** `DEMO_USER_ID` → `DEMO_STATS_USER_ID` + TODO(auth)
- **H1** `revalidatePath` explicit `/vi/sun-kudos` + `/en/sun-kudos`
- **H2** TODO(auth) — userId from caller, not session
- **M1** CopyLink catch shows "Không thể sao chép"
- **M3** Context value wrapped in `useMemo`
- **M5/M6** Carousel + LikeButton aria-labels → i18n

## Out of scope (placeholder/toast)
- Send-kudos dialog (input click → toast)
- "Mở quà" dialog
- Spotlight pan/zoom + search
- Image gallery + lightbox
- Profile pages (links go to placeholder route)
- Real-time updates (SSE/WS)
- Hashtag-from-card-click filter sync
- Pagination (small dataset, all in one page)
- Tests
