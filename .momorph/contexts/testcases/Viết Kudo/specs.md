# Viết Kudo (Send-kudos modal) — Normalized Specs

## Screen Overview
Modal dialog for composing and sending a kudos to a teammate. Contains a title, a required
recipient autocomplete, a rich-text content editor (formatting toolbar + @mentions, required),
a required hashtag chip field (1–5), an optional image-upload area (max 5), an anonymous-send
toggle, and a footer with "Hủy" (cancel) and "Gửi" (submit). Modal-only (no standalone URL).

## UI Elements
- Title (A): "Gửi lời cám ơn và ghi nhận đến đồng đội". Static.
- Recipient selector (B): label "Người nhận" (* required); search input (B.2) placeholder "Tìm kiếm" with dropdown arrow. Autocomplete list of Sunners.
- Editor toolbar (C): Bold (C.1), Italic (C.2), Stroke/strikethrough (C.3), Number/list (C.4), Link (C.5), Quote (C.6) — toggle buttons; Link opens a URL dialog (with open-in-new-tab option).
- Content textarea (D): required; placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"; supports "@ + name" mentions. Hint (D.1) always shown: "Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác".
- Hashtag field (E / E.2): label "Hashtag" (* required); "+ Hashtag" button opens a dropdown; selected tags shown as chips with "x" to remove; note "Tối đa 5".
- Image upload (F): label "Image"; "+ Image" opens file picker; thumbnails (F.2–F.4) each with "x" to remove; note "Tối đa 5". Optional.
- Anonymous toggle (G): "Gửi lời cám ơn và ghi nhận ẩn danh"; when on, reveals a field to enter the anonymous name. Optional (boolean).
- Footer (H): "Hủy" (H.1) and "Gửi" (H.2).

## Validation Rules
- Recipient (B.2): Required; must select a valid existing Sunner from the autocomplete (min 1 char to search); empty → red border + error message.
- Content (D): Required.
- Hashtag (E): Required; Min 1 tag; Max 5 tags.
- Image (F): Optional; Max 5 images.

## User Interactions
- Recipient search: type to filter the Sunner list (autocomplete); click a result to populate the field.
- Toolbar: click Bold/Italic/Stroke/Number/Quote to toggle formatting on selection/new text; click Link to open a URL dialog and insert a link.
- Content: type "@" + name to get mention suggestions for teammates.
- Hashtag: click "+ Hashtag" → dropdown; add creates a chip; click chip "x" to remove.
- Image: click "+ Image" → file picker; added images show as thumbnails; click thumbnail "x" to remove; "+ Image" hides once 5 images are added.
- Anonymous toggle: click to enable/disable; enabling reveals the anonymous-name field.
- "Hủy": close the modal and discard all changes (no data sent).
- "Gửi": validate the form and submit; show loading; close the modal on success.

## Functional / Business Rules
- "Gửi" is disabled until all required fields (recipient, content, hashtag) are filled.
- Hashtag field accepts between 1 and 5 tags.
- Image upload accepts at most 5 images; the add button disappears at 5.

## Security Considerations
- Anonymous send option hides the sender identity (sender chooses an anonymous name).
