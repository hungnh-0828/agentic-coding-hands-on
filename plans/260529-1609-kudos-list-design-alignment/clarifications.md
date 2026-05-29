# Clarifications — Kudos Live Board Design Alignment

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ`
Screen: `Sun* Kudos - Live board` (MaZUn5xHXZ)

## Session 2026-05-29

- Q: Fix scope → A: Visual alignment + data work (migration/seed/query for real avatars, Hero badges, star count, image gallery).
- Q: Avatars source → A: seed deterministic placeholder photos (i.pravatar.cc); add `users.avatar_url`; fall back to initials when null.
- Q: Kudos images → A: `kudos.image_urls` (already exists, migration 0005); seed picsum URLs; show up to 5 thumbnails.
- Q: Hero badge tiers → A: derive from received-kudos count using existing star thresholds (1★=10, 2★=20, 3★=50). New Hero (<10) → Rising Hero (≥10) → Super Hero (≥20) → Legend Hero (≥50).
- Q: "Mở quà" button label → A: align to design wording "Mở Secret Box".
- Q: Profile search field on banner → A: visual-only (no backend), consistent with prior visual-only send input.
- Q: Spotlight activity-log feed + pan/zoom → A: out of scope (decorative); render dark canvas + centered count + word cloud + colored edge only.

## Exact design values (from MCP, authoritative)
- All-Kudos card: bg `#FFF8E1`, radius `24px`, padding `40px 40px 16px`, gap `16px`.
- Hashtags: red/coral text.
- Badge New Hero: dark navy pill / white text. Badge Legend Hero: gold gradient pill / dark text + star.
- Prize name color `#FFEA9E`; avatar 64px, white border.
