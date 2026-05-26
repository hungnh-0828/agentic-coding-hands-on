# Clarifications — Sun* Kudos Live Board

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ`
Screen: `Sun* Kudos - Live board` (MaZUn5xHXZ)

## Session 2026-05-26

- Q: Scope → A: Full structure + DB + like toggle. Skip: send-kudos dialog, mở quà dialog, gallery lightbox, pan/zoom, profile pages, real-time.

## Defaults applied
- Q: Branch → A: stay on `feat/kudos-list`
- Q: Auth → A: client `AuthGuard` (consistent with awards-info)
- Q: Schema → A: Migration 0004 — departments, hashtags, kudos, kudos_hashtags, kudos_likes + users.department_id; RLS permissive for demo
- Q: Filter strategy → A: Server fetches ALL data; filter state held in `KudosFilters` client component which propagates via React context to both Highlight + All sections (simplest given small dataset)
- Q: Hashtag from card click → out of scope (would require lifting state above page boundary)
- Q: Star count (hoa thị) → A: Computed at query time (1*=10 received, 2*=20, 3*=50)
- Q: Send-kudos input → A: Visual only, click → toast
- Q: Carousel → A: prev/next buttons, active card centered + emphasized via opacity; no fade animation
- Q: Spotlight → A: simplified static word cloud (random offset positions); total `{count} KUDOS` from DB count
- Q: Like business rules → A: Implement (1) sender can't like own kudos (button disabled), (2) one like per user (toggle), (3) special-day +2 weight stored on kudos_likes.weight (admin config out of scope, default 1)
- Q: Mocked auth → A: Use existing MockAuthContext for current user; default user id = demo user 1 (`00000000-0000-0000-0000-000000000001`)
- Q: "Mở quà" / recent prize lists → A: Hardcoded mock data in sidebar (no separate table)
- Q: i18n → A: New `kudos.*` namespace; design content is mostly Vietnamese — provide reasonable English equivalents
