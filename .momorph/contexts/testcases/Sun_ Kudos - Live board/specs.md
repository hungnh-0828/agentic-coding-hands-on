# Sun* Kudos - Live board — Normalized Specs

## Screen Overview
Authenticated live board for Sun* Kudos. Top banner, a "record kudos" input that opens the
send-kudos dialog, a HIGHLIGHT KUDOS carousel (top-hearted kudos) with Hashtag/Department
filters, an interactive Spotlight board (word cloud of recipients with search + pan/zoom),
an ALL KUDOS infinite-scroll feed, and a right sidebar with personal stats, an "Mở quà"
(open gift) button, and two leaderboards. Kudos data and counts come from the database.

## UI Elements
- Banner (A): title "Hệ thống ghi nhận lời cảm ơn" + SAA 2025 KUDOS logo. Read-only.
- Record input (A.1): pill text field, placeholder "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?", pencil icon. Click opens the send-kudos dialog.
- HIGHLIGHT KUDOS (B): subtitle "Sun* Annual Awards 2025" + title "HIGHLIGHT KUDOS"; filters "Hashtag" (B.1.1) and "Phòng ban" (B.1.2) dropdowns (options from DB); carousel (B.2) of 5 top-hearted cards; nav arrows + pagination "2/5" (B.5).
- Kudos card (B.3 / C.3): sender info (avatar, name, department, star count "hoa thị", title), receiver info, post time ("HH:mm - MM/DD/YYYY"), content (Highlight max 3 lines, All max 5 lines, else "..."), hashtags (max 5 on one line, else "..."), optional gallery (max 5 thumbnails), heart count + heart icon, "Copy Link", "Xem chi tiết".
- Spotlight board (B.7): canvas word cloud of recipient names; header "388 KUDOS" (total from DB) + search bar (B.7.3, placeholder "Tìm kiếm", max 100) + "Pan/Zoom" toggle (B.7.2). States: loading, empty, interactive.
- ALL KUDOS (C): subtitle + title "ALL KUDOS"; feed of kudos cards; infinite scroll.
- Sidebar (D): stats box (D.1) — "Số Kudos bạn nhận được", "Số Kudos bạn đã gửi", "Số tim bạn nhận được", "Số Secret Box bạn đã mở", "Số Secret Box chưa mở"; "Mở quà" button (D.1.8); leaderboards "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" and "10 SUNNER NHẬN QUÀ MỚI NHẤT" (avatar + name + description); independent scroll.

## Validation Rules
- Spotlight search (B.7.3): max length 100; not required.

## User Interactions
- Click record input → open send-kudos dialog.
- Click Hashtag / Phòng ban filter → open dropdown; select option → filter BOTH Highlight and All Kudos, refresh carousel, reset pagination to 1.
- Click a hashtag inside a card → set the Hashtag filter to that tag and update both views.
- Carousel: click left/right arrow → previous/next slide and update pagination; left arrow disabled on slide 1, right arrow disabled on slide 5; active slide centered/highlighted, others dimmed.
- Click a kudos card / "Xem chi tiết" → open kudos detail.
- Click heart → toggle like, update count and active state.
- Click "Copy Link" → copy URL, show toast "Link copied — ready to share!".
- Click gallery image → open full-size image (max 5 thumbnails shown).
- Click sender/receiver avatar or name → open that user's profile; hover → profile preview.
- Hover star count → show star-tier description tooltip (1★=10 Kudos, 2★=20, 3★=50).
- ALL KUDOS feed → infinite scroll loads more.
- Spotlight: hover node → tooltip (name + time); click node → open kudos detail; click "Pan/Zoom" → toggle pan/zoom mode; type in search + Enter/click icon → search Sunner.
- Click "Mở quà" → open Secret Box dialog (button disabled when not eligible).
- Click leaderboard avatar/name → open profile; hover → preview.

## Functional / Business Rules
- Highlight carousel shows the 5 kudos with the most hearts across the event.
- Heart rules: one like per user per kudos; the kudos sender cannot like their own kudos (heart disabled); each like adds 1 heart to the receiver's account; on admin-configured special days a like adds 2 hearts; unliking revokes the corresponding 1 or 2 hearts.
- Filtering by hashtag or department applies to both Highlight and All Kudos and resets carousel pagination to 1.
- Spotlight "388 KUDOS" total and filter option lists are queried from the database.
- Star count tiers: 1★ at 10 Kudos, 2★ at 20, 3★ at 50.

## Security Considerations
- Authenticated board; sidebar shows the current user's personal stats and secret boxes.
- Self-recognition guard: a user cannot like their own kudos (heart disabled for own posts).
