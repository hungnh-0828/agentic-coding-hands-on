# Project Changelog

All notable changes to SAA 2025 are recorded here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); dates are `YYYY-MM-DD`.

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
