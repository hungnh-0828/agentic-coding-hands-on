# Phase 05 — Integration (wire createKudos + visual validation)

Track: cross-track merge · Priority: P1 · Status: completed · Blocked by: 02, 04

## Context
Single merge point for Track A (UI: 03/04) and Track B (backend: 01/02). Wires the real action, loading state, success/close, board refresh. Owns the SHARED files so parallel phases never touch them.

## Files
- Modify: `app/[locale]/sun-kudos/page.tsx` (pass `board.people` + `board.hashtags` to the compose modal/provider), `components/kudos/compose/compose-kudo-form.tsx` (replace placeholder `onSubmit` with real `createKudos`)
- Read: `lib/kudos/actions.ts` (`createKudos`), `lib/kudos/queries.ts` (`people`, `title`), `components/kudos/kudos-board-context.tsx` (for `showToast` reuse on error)

## Implementation steps
1. Page: thread `people` (exclude sender in UI) + `hashtags` into the compose provider/modal as props (server data → client).
2. Form submit handler (client): React 19 pattern — wrap `createKudos(input)` in `startTransition` (or `useActionState`) for `pending`; mirror existing event-handler action style from `toggleKudosLike`.
3. On submit: disable Gửi + show loading (`pending`). On success: close modal, reset form; board reflects new post via `revalidatePath` (done server-side in action). Optionally `showToast` success via board context.
4. On error: keep modal open, surface error (toast/inline), re-enable Gửi.
5. Confirm `sender_not_receiver` cannot be triggered (sender excluded from recipient list + server guard).
6. Visual validation loop (momorph-implement-design Step 7): screenshot modal vs MoMorph frame 520:11602; correct colors/spacing/typography from node specs until faithful. DO NOT invent values.
7. `npx tsc --noEmit` + lint clean.

## Data flow (end-to-end)
page (server) fetch → people+hashtags+title → provider props → user fills form → submit → `startTransition(() => createKudos(input))` → server validates + INSERT kudos + kudos_hashtags + revalidate both locales → returns id → close modal → board re-renders with new Kudos card.

## Todo
- [ ] Pass people (sender-excluded) + hashtags from page to modal
- [ ] Replace placeholder onSubmit with real `createKudos` + `startTransition`/`useActionState`
- [ ] Loading state on Gửi; close+reset on success
- [ ] Error handling keeps modal open + message
- [ ] Visual validation vs MoMorph; fix from node specs
- [ ] tsc + lint clean

## Success criteria
- Open modal → fill required → Gửi → new Kudos appears on board after close; no full page flash beyond revalidate.
- Anonymous on → card/data reflect anonymous_name (display logic minimal; data persisted).
- Images persisted as data URLs in `image_urls`.
- Modal visually matches MoMorph frame (colors/spacing within node-spec tolerance).
- No console errors; tsc/lint pass.

## Risk assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| Stale board after insert (cache) | Med×Med | Action calls `revalidatePath` both locales; verify card appears |
| Large data-URL images bloat row/payload | Med×Med | Enforce 5-image cap + image-only type; note size as known demo limit |
| Client/server validation drift | Low×Med | Server re-validates (phase-02); UI is UX-only |
| Shared-file conflict with 03/04 | Low×High | 05 is sole owner of page.tsx + form submit wiring; 03 used self-contained context |

## Backwards compatibility
Board read path unchanged except additive `people`/`title`. Existing like/filter flows untouched.

## Next
Unblocks phase-06 (tests).
