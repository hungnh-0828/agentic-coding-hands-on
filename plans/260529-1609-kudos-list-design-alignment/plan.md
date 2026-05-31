# Plan — Kudos Live Board Design Alignment

**Status:** ✅ Complete — build/tsc/lint clean, 66/66 tests, visually verified vs Figma, reviewer fixes applied.
**Date:** 2026-05-29
**Source:** [Sun* Kudos - Live board](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ) (screenId: `MaZUn5xHXZ`)
**Clarifications:** [clarifications.md](./clarifications.md)
**Branch:** `fix/ui.kudos-list`

## Goal
Align `/sun-kudos` with the Figma design. Current page is generic dark placeholders; design is a branded board with a logo hero, cream cards, peek-carousel, dark spotlight canvas, and richer card data (avatars, Hero badges, image gallery).

## Phases / Todo

### Data layer
- [ ] 0006 migration: `users.avatar_url text`
- [ ] `next.config.ts`: image remotePatterns (i.pravatar.cc, picsum.photos)
- [ ] `seed.sql`: avatar_url for users; image_urls for kudos; extra kudos for badge variety
- [ ] `types.ts`: `KudosPerson.avatarUrl/receivedCount/starCount/badge`; `KudosPost.imageUrls`
- [ ] `queries.ts`: select avatar_url + image_urls; compute per-user receivedCount → star/badge

### Design tokens
- [ ] `globals.css`: `--color-saa-card #fff8e1`, content sub-box, hashtag red, badge colors

### Components
- [ ] `kudos-banner.tsx`: dark hero + `kudos-bg.png` + `kudos-logo.svg` wordmark + title (left), graphic (right)
- [ ] `send-kudos-input.tsx`: send pill + "Tìm kiếm profile Sunner" search (visual)
- [ ] `hero-badge.tsx` (new): tiered pill (New/Rising/Super/Legend Hero)
- [ ] `person-block.tsx` (new): avatar (img/initials) + name + dept + badge + star
- [ ] `kudos-image-gallery.tsx` (new): up to 5 square thumbnails
- [ ] `kudos-card.tsx`: cream card — header (sender/sent-icon/receiver), divider, time, title + pencil, content sub-box, gallery, red hashtags, like + copy link; highlight vs feed
- [ ] `highlight-section.tsx`: peek-carousel (center emphasized, sides faded) + circular arrows + `n/total`
- [ ] `spotlight-board.tsx`: dark canvas, big centered count, word cloud, colored edge
- [ ] `kudos-sidebar.tsx`: dark stat panel, gold values, "Mở Secret Box", avatar lists
- [ ] i18n vi/en: search placeholder, badge labels, edit aria; `sidebar.openBox` → "Mở Secret Box"

### Verify
- [ ] `tsc`/build compile clean
- [ ] Visual check vs design (playwright screenshot)
- [ ] reviewer + tester

## Out of scope
Spotlight pan/zoom + activity log, profile pages, real-time, send/secret-box dialogs (existing toasts kept).
