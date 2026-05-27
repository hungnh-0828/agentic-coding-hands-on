---
title: "Compose Kudo Modal (Viết Kudo)"
description: "Modal to compose & submit a Kudos (recipient, title, content, hashtags, images, anonymous) with real Supabase insert."
status: completed
priority: P2
effort: 9h
branch: feat/compose-kudos
tags: [kudos, modal, supabase, server-action, i18n, momorph]
created: 2026-05-27
completed: 2026-05-27
---

# Compose Kudo Modal (Viết Kudo)

Modal overlaid on the existing `sun-kudos` board. Lets the demo user send a Kudos to one Sunner
with a title (danh hiệu), rich-ish content, 1–5 hashtags, up to 5 images (data URLs), and an
optional anonymous display name. Submits via a real Supabase insert through a new `createKudos`
server action. All blocking decisions resolved in `clarifications.md`.

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 (frame 520:11602)
- Clarifications (authoritative): ./clarifications.md

## Key constraints
- Next 16.2.6 / React 19. Server Action = plain async fn called from event handler (mirror existing `toggleKudosLike`), NOT FormData. Revalidate `/vi/sun-kudos` + `/en/sun-kudos`.
- Sender = DEMO id `00000000-0000-0000-0000-000000000001`. DB check `sender_not_receiver` must hold.
- Files < 200 lines, kebab-case, YAGNI/KISS/DRY. Toolbar is VISUAL-ONLY.
- Visual values come from MoMorph node specs (implementer fetches), never invented. Design text = mock-data fallback.

## Tracks (parallel-runnable when executed by tkm:takumi)
- Track A (UI): phase-03, phase-04 — modal shell + form fields, mock data from Figma.
- Track B (backend/logic): phase-01, phase-02 — migration, types/queries, server action.
- Integration: phase-05 wires A+B. phase-06 tests.
A and B must NOT block each other (no cross-track blocks/blockedBy).

## Phases
| # | Phase | Track | Status | Blocked by |
|---|-------|-------|--------|-----------|
| 01 | DB migration 0005 (title/anonymous/images cols + RLS write) | B | completed | — |
| 02 | Types + queries (people, title) + `createKudos` action | B | completed | 01 |
| 03 | Modal shell + open/close state + i18n keys | A | completed | — |
| 04 | Form fields + validation/disabled state | A | completed | 03 |
| 05 | Integration: wire createKudos, loading, success/close, revalidate + visual validation | — | completed | 02, 04 |
| 06 | Tests | — | completed | 05 |

## Dependency notes
- 01 → 02 (queries select `title`, action inserts new cols; both need the migration applied locally).
- 03 → 04 (fields live inside the shell).
- 05 needs both 02 (action/queries) and 04 (form UI) but per MoMorph rule Track A (03/04) and Track B (01/02) stay independent — 05 is the single cross-track merge.
- 06 after 05.

## Data flow (summary)
Board page (server) → `fetchKudosBoard` now also returns `people` (recipient candidates) → `KudosBoardProvider` exposes people + modal open/close → `SendKudosInput` opens modal → user fills `ComposeKudoModal` form → on submit `createKudos({...})` inserts kudos + kudos_hashtags rows → `revalidatePath` both locales → modal closes, board re-renders with new post.

## File ownership (no overlap between parallel phases)
- B-track owns: `supabase/migrations/0005_*.sql`, `lib/kudos/types.ts`, `lib/kudos/queries.ts`, `lib/kudos/actions.ts`.
- A-track owns: `components/kudos/compose/*`, `messages/*.json`, edits to `send-kudos-input.tsx`.
- Shared (sequential, owned by 05): `kudos-board-context.tsx`, `app/[locale]/sun-kudos/page.tsx`.
  - NOTE: 03 needs modal open/close state. To avoid 03↔05 contention, 03 introduces a SELF-CONTAINED `compose-modal-context.tsx` (own provider) rather than editing the shared board context. 05 only wires the action.

## Completion Summary (2026-05-27)

**All 6 phases complete & verified.** All commits merged to feat/compose-kudos, tests green (62/62), tsc clean, eslint clean, npm build succeeds (17 pages), manual E2E verified (normal + anonymous submit → real Supabase insert → board refresh with title + anonymized sender).

**Review fixes applied:**
- H1 (High): Orphaned-row mitigation — compensating delete on hashtag-link failure if kudos insert succeeds
- M1 (Medium): Image size cap enforced (2MB per image, 5 max)
- M2 (Medium): Full-slug resolution check on hashtags (rejects partial matches)
- M3 (Medium): Anonymous display logic corrected (hides real sender, shows anonymous_name on card)
- M4 (Medium): Title rendering on kudos card verified

Minor notes (N1–N5) logged but not blocking (N1: zero-hashtag board edge N/A since 5 seeded; N5: community href="#" placeholder acceptable for demo).

**Reviewer score:** 7.5/10, 0 critical; all actionable findings addressed.

## Unresolved questions
None — all blocking items decided in clarifications.md. Delivery complete.
