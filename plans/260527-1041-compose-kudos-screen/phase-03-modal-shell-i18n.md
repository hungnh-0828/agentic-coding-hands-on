# Phase 03 — Modal Shell + Open/Close State + i18n (Track A / UI)

Track: A (UI) · Status: completed · Blocked by: — · MUST stay parallel to Track B (no cross-track blocks)

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 (frame 520:11602)
- Clarifications: ./clarifications.md

## Goal
Self-contained compose-modal context (open/close) + modal shell (cream/parchment panel, overlay, title "Gửi lời cám ơn và ghi nhận đến đồng đội", close X, footer Hủy/Gửi) wired to open from `send-kudos-input.tsx`. Add `kudos.compose` i18n namespace (vi primary + en mirror).

## Files
- Create: `components/kudos/compose/compose-modal-context.tsx`, `components/kudos/compose/compose-kudo-modal.tsx`
- Modify: `components/kudos/send-kudos-input.tsx` (replace `showToast(todoToast)` with open-modal), `app/[locale]/sun-kudos/page.tsx` (mount provider + modal inside KudosBoardProvider), `messages/vi.json` + `messages/en.json`
- Read: `kudos-card.tsx`, `kudos-filters.tsx` for saa-* token conventions; `kudos-board-context.tsx` for provider pattern

## Out of scope
- Form fields/validation (phase-04). Real submit (phase-05). Toolbar logic (visual only, phase-04).

## Integration contract
- Context exports `{ isOpen, open(), close() }` via `useComposeModal()`.
- Modal renders `children`/field slots from phase-04; footer Gửi button `disabled` + `onSubmit` props consumed in phase-04/05.

## Implementation notes
- Use MoMorph node specs for panel bg, radius, spacing, overlay opacity — DO NOT invent. Figma text = mock-data fallback.
- New context (NOT the shared board context) to avoid file contention with phase-05.
- Esc + overlay-click close; lock body scroll while open. Keep each file < 200 lines.
