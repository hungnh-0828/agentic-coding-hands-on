# Sun* Kudos - Live board — Viewpoints (filtered to explicit source)

Reference packaged overlaps: Carousel, Search, Tags, Galery, List_Management, Links.
Kept only viewpoints refining behavior already in the design; none add new behavior.

## Carousel (Highlight Kudos)
- Verify next/prev navigation and pagination index update.
- Verify arrow disabled state at first/last slide.
- Verify active slide centered/highlighted, others dimmed.

## Search (Spotlight)
- Verify search by keyword (Enter / icon), focus styling, max length 100.
- Verify empty/loading/interactive states.

## Tags / filters
- Verify selecting a hashtag or department filters both Highlight and All Kudos and resets pagination.

## List_Management (feed / leaderboards)
- Verify infinite scroll loads more items.
- Verify empty-state messages ("Hiện tại chưa có Kudos nào." / "Chưa có dữ liệu").

## Galery
- Verify clicking a gallery thumbnail opens full image (max 5 shown).

## Links / copy
- Verify "Copy Link" copies URL and shows the toast; "Xem chi tiết"/card opens detail; avatar/name opens profile.

## Discarded (not in design — do NOT generate)
- Sorting controls, manual pagination numbers (uses carousel + infinite scroll), edit/delete of kudos,
  send-kudos form validation (belongs to the send-kudos dialog screen).
