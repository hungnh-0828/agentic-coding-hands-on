# Hệ thống giải (Awards Information) — Normalized Specs

## Screen Overview
Awards-system information page for SAA 2025. Hero banner, a section title, a left category
menu (anchor navigation) paired with six read-only award-detail cards, and a Sun* Kudos
promo block at the bottom. Reachable from the Homepage award cards via a category hash
anchor that auto-scrolls to the matching section. Content is informational (read-only).

## UI Elements
- Keyvisual (3): hero banner image, title "ROOT FURTHER", subtitle "Sun* Annual Award 2025", logo/icon top corner. Decorative, no click. Alt "Keyvisual Sun* Annual Award 2025".
- Title (A): caption "Sun* annual awards 2025" + heading "Hệ thống giải thưởng SAA 2025". Static.
- Left Menu (C): 6 nav items — "Top Talent", "Top Project", "Top Project Leader", "Best Manager", "Signature 2025 - Creator", "MVP". Active item styled yellow + underline; hover highlights.
- Award detail cards (D.1–D.6): each card shows image (336x336), title, description, "Số lượng giải thưởng" (quantity + unit), "Giá trị giải thưởng" (prize value). Read-only. Values:
  - Top Talent: 10 (Đơn vị), 7.000.000 VNĐ each.
  - Top Project: 02 (Tập thể), 15.000.000 VNĐ each.
  - Top Project Leader: 03 (Cá nhân), 7.000.000 VNĐ.
  - Best Manager: 01 (Cá nhân), 10.000.000 VNĐ.
  - Signature 2025 - Creator: 01, 5.000.000 VNĐ (cá nhân) / 8.000.000 VNĐ (tập thể).
  - MVP (Most Valuable Person): 01, 15.000.000 VNĐ.
- Kudos promo (D1/D2): label "Phong trào ghi nhận", title "Sun* Kudos", description, image, "Chi tiết" button (hover lift).

## Validation Rules
(None — screen has no input fields.)

## User Interactions
- Click a left-menu item → scroll content to the matching award section and set that item active; hover → highlight.
- Click Kudos promo "Chi tiết" → navigate to Sun* Kudos page.
- Opening the page with a category hash anchor auto-scrolls to that award section.

## Functional / Business Rules
- The award list is a fixed set of 6 categories, each shown as a read-only info card.
- Left-menu items map 1:1 to the six award sections (anchor navigation).

## Security Considerations
- (None stated; informational content page.)
