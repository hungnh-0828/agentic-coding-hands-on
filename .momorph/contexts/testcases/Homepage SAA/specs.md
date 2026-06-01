# Homepage SAA — Normalized Specs

## Screen Overview
Authenticated landing page for SAA 2025 (redirect target after login). Sticky top header
with global navigation. Hero/key-visual section "ROOT FURTHER" with a live countdown, event
info, and two CTAs. Below: Root Further theme content, an award-categories grid (6 cards),
a Sun* Kudos promo block, and a footer. A floating quick-action widget button is fixed
bottom-right. Header shows logged-in user controls (notification, language, profile menu).

## UI Elements
- Header (A1, sticky): logo (left); nav links "About SAA 2025" (selected by default on this
  page), "Awards Information", "Sun* Kudos"; right controls — Notification bell, Language "VN",
  user Profile icon.
  - Notification (A1.6): bell icon, red badge when unread, opens notification panel.
  - Language (A1.7): "VN"; click opens menu; options VN / EN.
  - Profile icon (A1.8): opens account menu — Profile / Sign out / Admin Dashboard (admin role only). Links Dropdown-profile.
- Hero / Key Visual (3.5): big "ROOT FURTHER" title, "Coming soon" subtitle, countdown, event info, CTA buttons, decorative dark background.
  - Countdown (B1/B1.3): title "Coming soon"; 3 tiles DAYS / HOURS / MINUTES, 2 digits each (0-padded). Target datetime configurable via env var (ISO-8601). Auto-updates in real time (per minute). When it reaches 0: hide "Coming soon" subtitle, keep tiles at 00.
  - Event Info (B2): labels "Thời gian:" → "18h30", "Địa điểm:" → "Nhà hát nghệ thuật quân đội"; note "Tường thuật trực tiếp tại Group Facebook Sun* Family". Static.
  - CTA (B3): "ABOUT AWARDS" (filled/hover style), "ABOUT KUDOS" (outline/normal style).
- Root Further Content (B4): theme description paragraphs + quote "A tree with deep roots fears no storm". Static.
- Awards Section: header C1 ("Sun* annual awards 2025", "Hệ thống giải thưởng", subtext); grid C2 of 6 cards — Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP. Each card: thumbnail + title + short description (max 2 lines, ellipsis) + "Chi tiết" link. Grid 3 cols desktop / 2 tablet / 1 mobile.
- Kudos Promo (D1/D2): label "Phong trào ghi nhận", title "Sun* Kudos", description, image, "Chi tiết" button.
- Footer (7): logo (left); links About SAA 2025 / Awards Information / Sun* Kudos (center); copyright "Bản quyền thuộc về Sun* © 2025" (right).
- Widget Button (6): floating fixed bottom-right pill (~105x64), pencil icon + "/" + SAA icon.

## Validation Rules
(None — screen has no input fields.)

## User Interactions
- Click header logo → navigate to homepage top.
- Click nav link "Awards Information" / "Sun* Kudos" → navigate to that page; hover → highlight; selected → yellow/underline.
- Click an already-selected nav link ("About SAA 2025") → scroll to top of page.
- Click Notification bell → open notification panel.
- Click Language → open language menu; select VN/EN → switch interface language.
- Click Profile icon → open account menu (Profile / Sign out / Admin Dashboard for admin).
- Click CTA "ABOUT AWARDS" → navigate to Awards Information; "ABOUT KUDOS" → navigate to Sun* Kudos.
- Click any award card element (image / title / "Chi tiết") → open Awards Information with a hash anchor (category slug); browser auto-scrolls to that category.
- Click Kudos promo "Chi tiết" → navigate to Sun* Kudos page.
- Click footer link → navigate to page; click footer logo → homepage top.
- Click Widget button → open quick-action menu.
- Countdown auto-updates per minute; on reaching 0 hides "Coming soon" and freezes tiles at 00.

## Functional / Business Rules
- "About SAA 2025" is the active nav item on this page.
- Award grid renders a fixed set of 6 categories; each card links to the matching anchor on Awards Information.
- Countdown target is read from an env-configured ISO-8601 datetime; tiles always show 2 digits.
- Profile menu exposes "Admin Dashboard" only for users with the admin role.

## Security Considerations
- Page is the authenticated landing area; header exposes logged-in user controls (profile, sign out).
- "Admin Dashboard" entry in the profile menu is restricted to the admin role (authorization).
