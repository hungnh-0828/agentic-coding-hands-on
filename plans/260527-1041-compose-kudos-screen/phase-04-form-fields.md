# Phase 04 — Form Fields + Validation/Disabled State (Track A / UI)

Track: A (UI) · Status: completed · Blocked by: 03 · MUST stay parallel to Track B

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 (frame 520:11602)
- Clarifications: ./clarifications.md

## Goal
Build all fields inside the modal (top→bottom): recipient autocomplete*, Danh hiệu*, editor+visual toolbar*, hashtag chips* (1–5), image upload (0–5, data URLs, jpg/png), anonymous checkbox + conditional name field, footer Hủy/Gửi. Manage form state locally; "Gửi" disabled until recipient + title + content + ≥1 hashtag present.

## Files
- Create (each < 200 lines): `components/kudos/compose/recipient-select.tsx`, `kudo-editor.tsx`, `hashtag-picker.tsx`, `image-uploader.tsx`, `compose-kudo-form.tsx` (composes fields + holds form state + disabled logic), optional `use-compose-form.ts` hook for state
- Modify: `compose-kudo-modal.tsx` (mount form), `messages/vi.json` + `messages/en.json` (field labels/hints/placeholders under `kudos.compose`)
- Read: phase-02 types for `CreateKudosInput` shape; board people/hashtags source (passed as props from page in phase-05)

## Out of scope
- Real `createKudos` call, loading spinner, success/close, revalidate (phase-05). Wire `onSubmit(input)` + `submitting` as props/placeholder now.

## Field rules (from spec + clarifications)
- Recipient: search `people` by display_name/department; exclude DEMO sender; select exactly one. Required.
- Danh hiệu: text, placeholder + 2-line hint; maps to `title`. Required.
- Editor: toolbar B/I/S/list/link/quote VISUAL-ONLY (toggle active style, no real formatting) + "Tiêu chuẩn cộng đồng" link; textarea placeholder + "@ + tên" hint. Content required.
- Hashtag: "+ Hashtag" (note Tối đa 5), pick from board hashtags, chips with x; min 1, max 5; hide add at 5.
- Image: "+ Image" (note Tối đa 5), accept jpg/png only, read as data URL, thumbnails with x; max 5; hide add at 5; optional.
- Anonymous: checkbox default off; when on, reveal anonymous-name text field.
- Footer: Hủy (close+discard), Gửi (yellow primary) disabled until required filled.

## Integration contract (consumed by phase-05)
`CreateKudosInput` assembled in `compose-kudo-form.tsx`: `{ receiverId, title, content, hashtagSlugs, imageUrls, isAnonymous, anonymousName }`. Exposes `onSubmit(input)` + `submitting` + `isValid`.

## Notes
- Use MoMorph node specs for all colors/spacing/typography — DO NOT invent. Figma text = mock data.
- KISS: native `<input type=file>`, FileReader → data URL; native search filter (no lib).
