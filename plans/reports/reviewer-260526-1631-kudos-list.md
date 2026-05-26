# Code Review — Sun* Kudos Live Board (`feat/kudos-list`)

**Date:** 2026-05-26
**Reviewer:** Staff Engineer (reviewer agent)
**Branch:** `feat/kudos-list`
**Files reviewed:** 15 new/modified files, ~907 LOC in kudos layer + migration + seed + i18n

---

## Verdict: APPROVE_WITH_FIXES

**Score: 7.5 / 10**

Solid first pass. Architecture is clean, optimistic like + rollback is correct for the single-user case, and the component tree is well-scoped. Three issues block a clean ship: a race condition on rapid double-click, a silent error swallow in the server action, and the `DEMO_USER_ID` hardcode on the server side leaking into the sidebar stats.

---

## Critical (must fix)

### C1 — Race condition: rapid double-click sends two concurrent toggles
**File:** `components/kudos/kudos-board-context.tsx:99–147`

`useTransition` does not debounce or serialize calls. If a user double-clicks the like button before the first `startTransition` resolves, two concurrent `toggleKudosLike` calls fly. The optimistic state is based on the snapshot captured at click time; the second call reads stale `isLiked` and queues a second rollback/commit. On the server the composite PK `(kudos_id, user_id)` prevents a duplicate row, but the second call will throw on insert (row exists) and trigger a rollback, leaving the client in the opposite state from the server.

The `disabled={isLikePending}` on `LikeButton` is supposed to guard this, but **`isLikePending` is a single shared boolean for the entire board**, not per-card. When user A is liking card 1 while clicking card 2, card 2 is blocked — that's the intent — but clicking the same card twice in quick succession before React re-renders the disabled state on the next tick is still possible.

**Fix:** track pending state per `kudosId`:
```ts
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

const toggleLike = useCallback((kudosId: string) => {
  if (pendingIds.has(kudosId)) return;   // guard
  setPendingIds(prev => new Set(prev).add(kudosId));
  // ... optimistic update ...
  startTransition(async () => {
    try { await toggleKudosLike(kudosId, currentUserId); }
    catch { /* rollback */ }
    finally { setPendingIds(prev => { const s = new Set(prev); s.delete(kudosId); return s; }); }
  });
}, [pendingIds, currentUserId, kudos, showToast]);
```
Expose `isPendingForCard: (id: string) => boolean` from context; `LikeButton` uses it to disable itself.

---

### C2 — Server action insert error silently ignored
**File:** `lib/kudos/actions.ts:39`

```ts
await (supabase.from("kudos_likes") as any).insert(row);
```

There is no `if (insertResult.error) throw ...` check. If the insert fails (constraint violation, RLS rejection, network blip), the action returns `{ liked: true }` regardless. The caller's optimistic state will stay "liked" but nothing was written to the DB. On next page load, the like will appear gone.

The workaround cast `as any` is needed to bypass generic narrowing — that's acceptable — but the error must still be checked:
```ts
const { error } = await (supabase.from("kudos_likes") as any).insert(row);
if (error) throw new Error(error.message);
```

---

### C3 — Hardcoded `DEMO_USER_ID` on the server page drives sidebar stats
**File:** `app/[locale]/sun-kudos/page.tsx:19, 41`

```ts
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
fetchKudosStats(DEMO_USER_ID)
```

Every visitor — regardless of who they are — sees Demo User's stats in the sidebar. When a real auth session is added, this will need to be replaced with `session.user.id`. Even as a known demo limitation, the constant should be isolated or commented to block accidental forward-compat: it currently looks like the real pattern rather than a placeholder.

**Minimum fix:** rename to `DEMO_STATS_USER_ID` and add a `// TODO(auth): replace with session.user.id` comment so it's unforgettable at real-auth wiring time.

---

## High Priority (should fix)

### H1 — Rollback in context reads stale `kudos` state, not closure snapshot
**File:** `components/kudos/kudos-board-context.tsx:130–140`

The rollback inside `startTransition` uses the functional `prev => ...` form (good) but re-applies the inverse of `isLiked` captured at toggle-call time. If a second toggle fires before the first resolves (C1), `isLiked` in the second closure is already stale. This is partially covered by fixing C1, but worth explicitly noting.

Also: on success the server returns `{ liked: boolean }` but the context **never uses the return value** to reconcile server truth. The optimistic state stays indefinitely. For this demo scope it's fine (board revalidates on next server render), but the pattern is fragile if revalidation is delayed.

### H2 — `revalidatePath` uses a template pattern that may not match
**File:** `lib/kudos/actions.ts:33, 40`

```ts
revalidatePath("/[locale]/sun-kudos", "page");
```

Next.js `revalidatePath` with `"page"` scope matches the exact path string, not a pattern. The string `/[locale]/sun-kudos` is the **file-system route segment** syntax. Whether Next.js accepts this as a wildcard or treats it as a literal string `/[locale]/sun-kudos` depends on the framework version. In Next.js 15+ the documented form for dynamic routes is either `/vi/sun-kudos` (specific) or call `revalidatePath("/", "layout")` to bust everything. If this is wrong, the server revalidation after a like toggle is silently a no-op — not a crash, but a correctness issue.

**Fix:** call both locales explicitly, or use layout-level revalidation:
```ts
revalidatePath("/vi/sun-kudos", "page");
revalidatePath("/en/sun-kudos", "page");
```

### H3 — Server action trusts caller-supplied `userId` without any identity check
**File:** `lib/kudos/actions.ts:11`

The server action accepts `(kudosId: string, userId: string)` from the client. The `sender == userId` guard prevents self-liking, but any arbitrary `userId` can be passed — any client can like on behalf of any other user. The RLS policy `for all ... using (true) with check (true)` provides no row-level identity enforcement. This is a known limitation (flagged as TODO in the prompt), but the risk should be documented.

**Minimum fix:** add a comment: `// TODO(auth): verify userId == session.user.id before trusting caller`. Without a real session, the attack surface is accepted by design, but it must not be forgotten.

---

## Medium Priority

### M1 — `CopyLinkButton` shows success toast even when clipboard write fails
**File:** `components/kudos/copy-link-button.tsx:13–18`

```ts
try {
  await navigator.clipboard.writeText(url);
  showToast(t("copiedToast"));
} catch {
  showToast(t("copiedToast"));  // same message on failure
}
```

Both branches call the same toast. On permission denial the user thinks the link was copied but it wasn't. Fix: show a distinct failure message, or use `document.execCommand` fallback.

### M2 — `fetchKudosBoard` partial failure is masked
**File:** `lib/kudos/queries.ts:41`

Only `kudosRes.error` is checked; errors from users, departments, hashtags, likes queries are silently ignored (the `?? []` fallback swallows them). A failed `usersRes` means all kudos are filtered out because `sender`/`receiver` won't resolve — the function returns an empty `kudos` array with no error log. This is very hard to debug in production.

**Fix:** at minimum `console.error` on non-kudos query errors, or fold them into the EMPTY return.

### M3 — `KudosBoardProvider` context `value` object recreated every render
**File:** `components/kudos/kudos-board-context.tsx:149–165`

`value` is a plain object literal assigned every render. Even though individual callbacks are memoized, the context value reference changes on every state update, triggering all context consumers to re-render. With 13 components consuming the context this will cause unnecessary cascades.

**Fix:** wrap `value` in `useMemo` keyed on all the primitives:
```ts
const value = useMemo(() => ({ ... }), [
  hashtags, departments, totalKudos, receiverNames,
  selectedHashtag, selectedDept, filteredKudos, highlightKudos,
  currentUserId, toggleLike, isLikePending, showToast, toast
]);
```

### M4 — `formatTimestamp` uses local timezone
**File:** `components/kudos/kudos-card.tsx:11–14`

`new Date(iso)` + `getHours()`/`getMinutes()` uses the browser's local timezone. Vietnamese users see VN time; a viewer in a different timezone sees a different time for the same kudos. For a team-internal Vietnamese tool this is probably fine, but the inconsistency should be intentional.

If consistent timestamps matter: `toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })`.

### M5 — `highlight-section.tsx` arrow labels not i18n'd
**File:** `components/kudos/highlight-section.tsx:43, 52`

```tsx
aria-label="Previous"
aria-label="Next"
```

These are English-only strings. Should be `t("prev")` / `t("next")` from the `kudos.highlight` namespace.

### M6 — `like-button.tsx` `aria-label` hardcoded in Vietnamese
**File:** `components/kudos/like-button.tsx:21`

```tsx
aria-label={`Thả tim — hiện ${totalWeight}`}
```

Hardcoded Vietnamese. EN locale will render Vietnamese in accessibility tools.

---

## Nit / Low Priority

### N1 — `kudos-board-context.tsx` toast auto-dismiss logic is correct but fragile
The `useEffect` on `toast` clears the previous timer on re-trigger. This is correct. But if a new toast fires before the 2500ms window expires (e.g., copy-link right after a like), the first message is replaced and the timer resets. That's acceptable UX for a demo but worth noting as a known behavior (a toast queue would fix it).

### N2 — Seed `kudos_likes` inserts weight=2 for two rows without comment
**File:** `supabase/seed.sql:70, 78`

Two likes have `weight=2`, which exercises the `check (weight in (1,2))` constraint — good. But there's no comment explaining why, which will confuse anyone reading the seed later. Add a brief `-- double-weight (premium like)` comment.

### N3 — `spotlight-board.tsx` uses two `useTranslations` calls for different namespaces
**File:** `components/kudos/spotlight-board.tsx:16–17`

Minor: the `tEmpty` alias re-uses `kudos.allKudos` for the empty text. Reasonable for now since there's no dedicated spotlight empty string; just note it's intentional or add a `spotlight.empty` key.

### N4 — `KudosSidebar` uses `useKudosBoard()` only for `showToast`
**File:** `components/kudos/kudos-sidebar.tsx:25`

The sidebar subscribes to the full board context just for one method. When any filter changes or likes toggle, the sidebar re-renders unnecessarily. Splitting `showToast` into a separate context (or accepting it as a prop) would stop the cascade. Low-impact at current scale.

### N5 — `AllKudosSection` and `HighlightSection` both render an inner `mx-auto max-w-7xl` wrapper but `page.tsx` already wraps them in a max-width container
**File:** `app/[locale]/sun-kudos/page.tsx:51–63`

The page wraps the bottom section in `max-w-7xl` but `AllKudosSection` and `HighlightSection` also declare their own `mx-auto w-full max-w-7xl`. No visual bug (redundant constraint is harmless), but it's confusing for future layout changes.

---

## Edge Cases Found (scouting)

1. **Empty board (`kudos = []`):** `highlightKudos` is `[]`, `safeIndex` is `0`, `current` is `undefined` — the `{current ? ... : <empty>}` guard in `HighlightSection` handles this correctly. `AllKudosSection` likewise handles empty. `SpotlightBoard` handles empty. No crash path.

2. **Filter produces 0 results after carousel is on index 4:** `safeIndex = Math.min(index, total - 1)` where `total = 0` computes `Math.min(4, -1) = -1`, so `safeIndex = 0` via `total === 0 ? 0 : ...`. The ternary guard is correct. Good.

3. **Kudos with unknown sender/receiver (dangling FK):** filtered with `.filter((k): k is KudosPost => k !== null)` in `fetchKudosBoard`. Safe.

4. **`receiverNames` dedup:** `Array.from(new Set(...))` — correct; spotlight won't show duplicate names.

5. **`like-button.tsx` isOwner check uses `kudos.sender.id` not `kudos.receiver.id`:** correct — senders can't like their own post. Receivers can like their own received post, which is probably intentional.

6. **`toggleKudosLike` — sender check vs receiver check:** server action checks `kudos.sender_id === userId` (guards sender), which matches client guard. If the business rule ever changes to "receiver can't like either," both must be updated.

7. **`hashOffset` for spotlight:** deterministic on `name` — same name always gets same position. If two receivers share a display name they'd overlap. Low risk with seed data.

---

## Strengths

- Optimistic rollback pattern is clean and idiomatic — functional `prev =>` form avoids stale closure on the rollback path.
- Server-side guard for sender-can't-like-own is present (not just client-side), which is the right layering even in a mock-auth context.
- All file sizes are under 200 lines; component boundaries are clear.
- Migration uses `add column if not exists`, `create table if not exists` — safe for re-runs.
- Foreign key `on delete cascade` on `kudos_likes` prevents orphaned like rows.
- `check (sender_id <> receiver_id)` DB constraint is a nice correctness belt-and-suspenders.
- `kudos_created_at_idx`, `kudos_receiver_idx`, `kudos_sender_idx` — correct indexes for the filter queries in `fetchKudosStats`.
- `KudosBanner` uses `<section aria-label>`, toast uses `role="status" aria-live="polite"`, `LikeButton` uses `aria-pressed` — a11y basics are covered.
- i18n keys are consistent across en/vi for all 25+ new keys; no missing keys between locales.
- `EMPTY` sentinel in `queries.ts` ensures the page renders an empty state rather than crashing on DB errors.

---

## Recommended Actions (priority order)

1. **[C1]** Replace shared `isLikePending` with per-card pending set to prevent double-click race.
2. **[C2]** Check and throw on insert error in `toggleKudosLike` — currently a silent no-op on failure.
3. **[H2]** Fix `revalidatePath` — use explicit locale paths `/vi/sun-kudos` + `/en/sun-kudos`, or `"layout"` scope.
4. **[C3]** Rename `DEMO_USER_ID` → `DEMO_STATS_USER_ID` + add auth TODO comment.
5. **[M1]** Show failure toast text in `CopyLinkButton` catch branch.
6. **[M3]** Wrap `context value` in `useMemo` in `KudosBoardProvider`.
7. **[M5, M6]** Move hardcoded `"Previous"` / `"Next"` / Vietnamese `aria-label` strings into i18n.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is functionally solid and architecturally clean. Three issues (C1 double-click race, C2 silent insert error, H2 broken revalidatePath) are correctness bugs that will manifest in production; the rest are moderate or nit-level. Safe to merge after C1, C2, and H2 are fixed.
**Concerns:** C1 and C2 are correctness bugs; H2 means like-toggle revalidation is likely a no-op today.
