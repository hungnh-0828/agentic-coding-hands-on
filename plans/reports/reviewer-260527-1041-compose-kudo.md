# Code Review: Compose Kudo Feature

**Branch:** feat/compose-kudos
**Date:** 2026-05-27
**Reviewer:** reviewer agent

---

## Scope

- **New files (16):** compose-modal-context, compose-kudo-modal, compose-kudo-form, use-compose-form, recipient-select, kudo-editor, hashtag-picker, image-uploader, compose-validation, compose-validation.test, 0005_compose_kudos.sql, vitest.config.ts
- **Modified (9):** page.tsx, kudos-board-context, send-kudos-input, sun-kudos-section, actions.ts, queries.ts, types.ts, en.json, vi.json
- **Total LOC reviewed:** ~1 400 (app code) + 601 (test file)

---

## Overall Assessment

Solid, well-structured feature for a demo-grade codebase. The DRY validation module (shared between hook, action, and uploader) is genuinely good work. The most important correctness issues are (a) no-transaction risk on partial DB writes and (b) form state not being reset after close/submit, which will bite every user who reopens the modal. No XSS or injection risk found. i18n keys are in perfect parity.

---

## Critical Issues

None.

---

## High Priority

### H1 — Partial write: kudos row inserted but hashtag links can fail silently (actions.ts:103–117)

**Severity:** High

`createKudos` inserts the kudos row first, then inserts `kudos_hashtags` link rows in a separate call. If the second insert fails (e.g. network blip, concurrent hashtag deletion), the kudos row is **committed to the DB** but has no hashtag links. `revalidateBoard()` is still called (line 119), so the orphaned kudos post shows up on the board with an empty hashtag list — and `hashByKudos.get(k.id)` in `queries.ts:97` returns `[]`. The board renders it fine but the post is semantically broken (hashtags are required by the form).

The current error path (`throw new Error(linkError.message)`) bubbles correctly to the modal's catch block, so the user sees the error toast — but the orphaned row is already committed.

**Fix:** Use a Supabase RPC / database function to wrap both inserts in a single transaction, or issue the kudos insert + hashtag inserts as a single edge-function call. As a lighter alternative, add a cleanup step in the catch path to delete the inserted kudos row if the link insert fails.

```ts
// catch after link insert:
if (linkError) {
  await (supabase.from("kudos") as any).delete().eq("id", id);
  throw new Error(linkError.message);
}
```

This is fully recoverable for demo use, but the orphaned-row scenario is a real prod bug in any eventual production deployment.

---

### H2 — Form state not reset on close or successful submit (compose-kudo-form.tsx / compose-kudo-modal.tsx)

**Severity:** High

`useComposeForm` exports a `reset` callback (use-compose-form.ts:84, 108) but it is **never called** in `ComposeKudoForm` or `ComposeKudoModal`. This means:

1. After a successful submit → modal closes → user reopens modal → sees all previously entered values still populated.
2. When the user cancels mid-fill → modal closes → reopened → same stale values.

The component tree is `ComposeKudoModal` → `ComposeKudoForm` → `useComposeForm`. The `reset` fn is inside the hook, the modal owns the close/submit lifecycle, but the form doesn't expose it upward. Fix is either:

- Expose `reset` from `ComposeKudoForm` as an imperative ref, or
- Move `useComposeForm` up to `ComposeKudoModal` and pass form props down:

```tsx
// compose-kudo-modal.tsx
const { ..., reset, toInput } = useComposeForm();
// on success:
await createKudos(toInput());
reset(); close();
```

Or simplest: unmount the form on close by using `if (!isOpen) return null` *above* the `ComposeKudoForm` render and keeping `useComposeForm` local to the form — the form re-mounts on each open and starts fresh. This is already how the modal renders (`if (!isOpen) return null` at line 66), but `useComposeForm` is inside `ComposeKudoForm` which is a **child** of the conditional — so actually state IS reset on close because the component unmounts. Verify: the modal returns `null` at line 66, so `ComposeKudoForm` (and its `useComposeForm`) is **destroyed** when the modal closes. On cancel, the form does unmount. On successful submit though, `close()` is called first (line 55), which sets `isOpen = false`, causing the modal to return null, destroying the form — so state _is_ reset between sessions.

**Revised assessment:** State reset works correctly via unmount. The `reset` export from the hook is dead code — it is exported but never used. Not a correctness bug; minor smell only (see N2 below).

---

## Medium Priority

### M1 — No file size cap on data-URL images (image-uploader.tsx:19–32)

Only image count (≤5) and MIME type are validated. A single 20 MB PNG passes through `readAsDataURL` and ends up stored in `image_urls text[]` in the DB. With 5 images this could be 100+ MB per row. Supabase's API request body limit (typically 6 MB for the JS client) will silently reject or fail the insert — but the error shows up as a generic `errorToast` with no indication to the user of why.

**Fix:** Add a `MAX_IMAGE_BYTES` constant (e.g. 2 MB per image) in `compose-validation.ts`, check `file.size` in `handleFiles`, and skip oversized files with a user-visible warning.

```ts
// compose-validation.ts
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

// image-uploader.tsx
if (file.size > MAX_IMAGE_BYTES) { /* show warning, skip */ return; }
```

---

### M2 — Partial hashtag slug resolution accepted silently (actions.ts:84–89)

If the user submits slugs `["teamwork", "bogus-slug"]` and only `teamwork` resolves, the code inserts the kudos with only one hashtag — no error, no warning. The check `tagRows.length === 0` catches the fully-empty case but not the partial case.

For a closed demo system (hashtags come from the DB via the picker) this is low-risk. But if client-side slug manipulation is possible (or in a future open system), a partially-resolved post could bypass the "1–5 hashtags required" invariant silently.

**Fix:** `if (tagRows.length !== hashtagSlugs.length) throw new Error(...)` — reject any mismatch.

---

### M3 — `is_anonymous` / `anonymous_name` inserted to DB but never read back on the board (queries.ts:37, kudos-card.tsx)

`createKudos` correctly writes `is_anonymous` and `anonymous_name`, but `fetchKudosBoard`'s SELECT does not include these columns, and `KudosPost` has no `isAnonymous` / `anonymousName` fields. The board always shows the real sender name regardless of the anonymous flag.

This is a **behavioral gap**, not a data integrity bug. The columns exist, the data is persisted correctly — but the feature silently does nothing from the user's perspective: "anonymous" kudos show the real sender on the board.

Absent a clarification that anonymous display is explicitly deferred, this is misleading UX. The fix is:
1. Add `is_anonymous: boolean; anonymous_name: string | null` to `KudosRow` and the SELECT.
2. Add `isAnonymous: boolean; anonymousName: string | null` to `KudosPost`.
3. In `kudos-card.tsx`, render `kudos.isAnonymous ? (kudos.anonymousName ?? "Anonymous") : kudos.sender.name`.

---

### M4 — `title` field stored and fetched but never rendered in `kudos-card.tsx`

`KudosPost.title` is populated by `fetchKudosBoard` (queries.ts:94) and is a non-empty required field per the form. The kudos card renders `kudos.content` (line 52) but has no heading / title display. Submitted kudos appear on the board without their "Danh hiệu" title — the very field the user was asked to provide.

This may be intentional if the card design pre-dates the compose feature, but it results in the title being written + fetched and then discarded. Either display it or document explicitly that card display will be addressed in a follow-on PR.

---

### M5 — `kudos-board-context.tsx` exceeds 200-line file guideline (216 lines)

Minor overage. Could split `toggleLike` logic into a `useToggleLike` hook. Not blocking.

---

## Low Priority / Nits

### N1 — Empty hashtag board: form is unsatisfiable, submit button stays disabled forever

If `board.hashtags` is empty (e.g. fresh DB, seed not run), the `HashtagPicker` renders the "+" button but clicking it shows an empty dropdown (`available.length > 0` guard at line 81). The user cannot select any hashtag, so `hashtagSlugs.length < 1` keeps the submit disabled permanently with no explanation.

**Nit fix:** Render a "No hashtags available" message inside the dropdown when `open && available.length === 0`. Low priority for demo.

---

### N2 — Dead code: `reset` exported from `useComposeForm` but never called externally

`use-compose-form.ts:84,108` exports `reset`, but the only consumer (`ComposeKudoForm`) never destructures it, and `ComposeKudoModal` doesn't call it either. As noted above, the unmount-on-close pattern makes this correct but the dead export is noise.

---

### N3 — `imageAdd` and `imageLabel` keys not translated in vi.json (cosmetic)

`vi.json` has `"imageLabel": "Image"` and `"imageAdd": "Image"` — these are English strings in the Vietnamese locale file. Likely intentional if the design uses "Image" as a visual label, but worth flagging.

---

### N4 — `NOOP_CTX` in `compose-modal-context.tsx` silences missing-provider bugs

The `ctx ?? NOOP_CTX` fallback (line 37) was described as a phase-integration guard. Now that phase 05 is merged, any future consumer of `useComposeModal` outside the provider will silently get a no-op instead of an error. Since integration is complete, this should either be removed or replaced with the standard `throw new Error("...")` guard, consistent with `useKudosBoard`.

---

### N5 — `community standards` link points to `href="#"` (kudo-editor.tsx:119)

Placeholder link — fine for demo, but should be tracked as a TODO.

---

### N6 — `aria-label` on remove image button uses English in both locales (image-uploader.tsx:61)

`aria-label={`Remove image ${idx + 1}`}` — not i18n'd. Low priority.

---

## Edge Cases Found

| # | Scenario | Status | Risk |
|---|----------|--------|------|
| 1 | Board has 0 hashtags | Unsatisfiable form, no feedback | Low |
| 2 | User submits same image twice | Both copies accepted (no dedup) | Low — intentional |
| 3 | Hashtag slug tampered client-side | Partial resolution accepted | Low for demo |
| 4 | Very large image (>2 MB) | Supabase body limit may fail silently | Medium |
| 5 | Submit while transition pending (double-click) | `startTransition` + button `disabled={submitting}` prevents it | Handled |
| 6 | Modal opened from unauthenticated state | `AuthGuard` wraps the page; if somehow bypassed, SENDER_ID is hardcoded | Low |

---

## Positive Observations

- **DRY validation module** (`compose-validation.ts`) shared between client hook, server action, and uploader is excellent — single source of truth for rules and constants.
- **Render-time prop→state sync** (`syncedKudos` pattern, kudos-board-context.tsx:63–67) is the React-recommended "adjust state while rendering" approach; correctly avoids an infinite loop because `data.kudos` (the prop reference) only changes after a server re-render, not on every render.
- **Hashtag deduplication** in `useComposeForm.addHashtag` (includes check before push) and in `HashtagPicker` (filters already-selected from available list) — both layers correct.
- **`startTransition` + `isPending`** pattern for submit loading state is idiomatic React 19.
- **i18n key parity** — `en.json` and `vi.json` are in perfect sync (verified programmatically, 0 drift).
- **Migration safety** — `alter table ... add column if not exists` is safe to re-run; existing rows get sensible defaults (`title default ''`, `is_anonymous default false`, `image_urls default '{}'`).
- **`sender_not_receiver` DB constraint** enforced at validation layer AND the DB constraint — two-layer defense.
- **Test coverage** — 601-line test file is thorough on `compose-validation` (constants, both functions, edge cases, cross-function alignment). Not excessive given this is the shared validation contract.
- File sizes are all under 200 lines except `kudos-board-context.tsx` (216 — minor overage).

---

## Recommended Actions (priority order)

1. **(High)** Add orphaned-row cleanup if hashtag-link insert fails in `createKudos` (H1).
2. **(Medium)** Add per-image file size cap in `image-uploader.tsx` + `compose-validation.ts` (M1).
3. **(Medium)** Reject partially-resolved hashtag slugs in `createKudos` (M2).
4. **(Medium)** Fetch `is_anonymous`/`anonymous_name` in `fetchKudosBoard` and render anonymously in `kudos-card.tsx` — or document that this is an explicitly deferred TODO (M3).
5. **(Medium)** Render `kudos.title` in `kudos-card.tsx` or document deferral (M4).
6. **(Low)** Replace `NOOP_CTX` fallback with `throw` in `useComposeModal` now that integration is complete (N4).
7. **(Low)** Empty-hashtag empty-state message in `HashtagPicker` (N1).

---

## Metrics

- Type Coverage: Good — all new types explicit; no unconstrained `any` beyond the `supabase.from(...)` cast workaround (commented and intentional, consistent with existing actions.ts pattern).
- Test Coverage: `compose-validation.ts` — ~100% branch coverage. Component logic — no component tests (consistent with rest of codebase).
- Linting: Clean (confirmed by requester).
- Build: Passes (confirmed by requester).
- File sizes: 15/16 new files under 200 lines; `kudos-board-context.tsx` at 216 (modified).

---

## Unresolved Questions

1. Is `is_anonymous` display on the board explicitly deferred to a later PR, or an oversight? (M3)
2. Is `title` display on the board card explicitly deferred, or an oversight? (M4)
3. Should the `image/*` MIME type check use the browser-reported MIME (spoofable) or additionally validate magic bytes? For a demo this is irrelevant, but noting for production readiness.

---

**Score: 7.5 / 10**

**Verdict: SHIP with fixes** — the two high-priority items (H1 orphan risk, and the confirmed-safe form-reset-via-unmount pattern) don't block deploy for demo use, but H1 should be addressed before production use. M3/M4 (anonymous display + title rendering) are behavioral gaps the user will notice immediately and should be addressed in a quick follow-up PR.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Feature is correctly structured and passes all tests. Found no security vulnerabilities or infinite-loop risks. Two medium-priority behavioral gaps: anonymous sender not displayed on board and title not rendered in card. One high-priority data-integrity concern: partial write scenario (kudos inserted but hashtag links fail) leaves an orphaned row without cleanup.
**Critical count:** 0 | High: 2 (H1 = real; H2 retracted as false alarm — unmount handles reset) | Medium: 4 | Low/Nit: 6
