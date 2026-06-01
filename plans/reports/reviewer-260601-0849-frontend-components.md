# Frontend Components Review — 2026-06-01

**Scope:** ~35 components across hero/, awards/, awards-information/, kudos/, kudos/compose/, plus widget-button, site-footer, sun-kudos-section, root-further-content.
**LOC reviewed:** ~1 800
**Stack confirmed:** Next.js 16 App Router, React 19, next-intl, Tailwind v4, TypeScript.

---

## Critical Issues

None. No dangerouslySetInnerHTML, no JavaScript: hrefs, no secrets in source, no missing timer cleanup.

---

## High Priority

### 1. `use-compose-form.ts:32-40` — `isValid` computed with wrong `anonymousName` value
`isValid` is computed by calling `isComposeInputValid(…)` with `anonymousName: null` always, regardless of `form.anonymousName`. The validation function (`compose-validation.ts`) does not currently gate on `anonymousName`, so this is latent — but if the rule ever adds "non-empty anonymousName required when isAnonymous=true", the client guard will always report valid while `toInput()` passes the real value to the server. The inconsistency is already present and misleading.

**Fix:** Pass `form.isAnonymous && form.anonymousName.trim() ? form.anonymousName.trim() : null` (same expression used in `toInput()`) to keep the isValid check consistent with what is actually submitted.

---

### 2. `kudos-board-context.tsx:107-165` — Stale-closure race in `toggleLike`
`toggleLike` captures `kudos` and `pendingIds` via closure (both in its `useCallback` deps). Between the optimistic update (`setKudos`) and the rollback in the `catch` block, another render could have changed `kudos`. The rollback reads the closure-time snapshot of `kudos` to reconstruct the pre-toggle state, which can diverge from the current state if a concurrent `router.refresh()` re-synced the board in the meantime, silently overwriting the server-confirmed likes with stale local data.

**Fix:** Capture `target` and `isLiked` inside a functional state updater rather than from the closure:
```ts
setKudos((prev) => {
  const t = prev.find((k) => k.id === kudosId);
  // restore from prev, not from stale snapshot
  return t ? prev.map(k => k.id === kudosId ? { ...k, likes: original } : k) : prev;
});
```
Or, simpler: call `router.refresh()` on rollback to re-sync from server truth rather than attempting a manual undo.

---

### 3. `kudos-board-context.tsx:63-67` — State update during render (React 19 caveat)
The "adjust state while rendering" pattern (`if (syncedKudos !== data.kudos) { setSyncedKudos(…); setKudos(…); }`) is React's documented escape hatch but triggers two sequential renders and can confuse concurrent-mode schedulers. With React 19 and the App Router's aggressive caching, `data.kudos` identity changes on every `router.refresh()`, making this pattern fire on every refresh. The two synchronous `setState` calls in render path are not batched in all React 19 render phases.

**Fix:** Use a `useEffect` dependency on `data.kudos` (or a stable hash/length + timestamp) to merge external data asynchronously, or accept the double-render as a known trade-off and add a comment justifying it for reviewers.

---

### 4. `image-uploader.tsx:50` — Index key on removable list
`key={idx}` for thumbnail items that can be removed mid-list. When item at index 1 is removed, item at index 2 gets key `1` — React will reuse the DOM node for the wrong item, causing potential flicker or mis-rendered `<img>` src.

**Fix:** Use the data URL itself as key (it's unique per upload): `key={url}`. Already done correctly in `kudos-image-gallery.tsx` (`key={\`${url}-${i}\``).

---

## Medium Priority

### 5. `kudos-image-gallery.tsx:10` — Composite key with index fallback
`key={\`${url}-${i}\`}` — appending the index defeats the stability benefit of using the URL. If `url` is unique (data URLs are), just use `key={url}`. If two identical URLs can appear, index suffix is fine but should be documented.

### 6. `hashtag-picker.tsx:21` — Click-outside listener always registered
`document.addEventListener("mousedown", handleClickOutside)` is registered unconditionally (not only when `open === true`). This is a minor permanent listener per mounted `HashtagPicker`. Same pattern in `recipient-select.tsx:30`. Functionally benign on a single-modal page but wastes listener budget when multiple pickers mount simultaneously. **Fix:** Gate the listener registration on `open`:
```ts
useEffect(() => {
  if (!open) return;
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [open, handleClickOutside]);
```

### 7. `kudo-editor.tsx:13-71` — Toolbar is decorative only
Format buttons toggle `activeTools` state but do not apply any formatting to the `<textarea>` value. The `aria-pressed` attribute correctly signals state, but pressing "Bold" does nothing to the text — a11y and UX mismatch. Acceptable for a demo; should be a documented TODO.

### 8. `compose-kudo-modal.tsx:66` — Dialog missing `aria-labelledby`
`aria-label={t("modalTitle")}` on the `role="dialog"` div is valid but `aria-labelledby` pointing to the `<h2>` at line 84 is preferred (screen readers will read live content rather than a static attribute string). Low severity.

### 9. `kudos-board-context.tsx:110` — Hardcoded Vietnamese toast string
`showToast("Vui lòng đăng nhập để thả tim")` at line 110 and two others (lines 119, 154) are not i18n-translated. All other toasts use `t(…)`. Inconsistency — these will not change on locale switch.

### 10. `awards-information-nav.tsx` — `isManualScroll` ref not reset if component unmounts mid-timeout
`scrollTimerRef.current` cleanup on unmount (lines 17-21) correctly clears the timeout, but `isManualScroll.current` is never reset to `false` on unmount. Because `isManualScroll` is a ref (not state), it does not matter for the unmounted component, but a fast remount within 800 ms would inherit a stale `true` value and suppress the first observer callback. Edge-case but real if the component is conditionally rendered.

### 11. `use-compose-form.ts` — `INITIAL_STATE` is a module-level const
`INITIAL_STATE` is shared but never mutated (all state updates use functional form), so this is safe. However, `useComposeForm` does not expose a `reset()` function. When the modal closes and reopens, the form retains its previous values (the hook re-mounts with `ComposeKudoForm`, which is fine since the modal is unmounted on close). Confirm `ComposeKudoModal` actually unmounts `ComposeKudoForm` on close — it does (`if (!isOpen) return null`), so state resets correctly. No bug, noting for completeness.

---

## Low Priority

### 12. `root-further-content.tsx:6-7` — `t.raw()` cast to `string[]`
`t.raw("intro") as string[]` — unchecked cast. If the translation key ever returns a non-array (misconfiguration), this will fail silently or throw at `.map()`. A runtime guard (`Array.isArray(intro) ? intro : []`) would prevent a white-screen.

### 13. `spotlight-board.tsx:9-13` — Hash function produces `| 0` signed-integer overflow
`h = (h * 31 + charCodeAt) | 0` — standard Java-style hash, intentional 32-bit wrap. `Math.abs(h) % max` is correct for non-negative modulo. No bug; the `| 0` is deliberate and should have a comment explaining the intentional overflow.

### 14. `kudos-card.tsx:13-17` — `formatTimestamp` uses local timezone
`d.getHours()` / `d.getMonth()` etc. use the browser's local timezone, which will show different timestamps to users in different timezones. If event data is always Vietnam time (UTC+7), consider `toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })` for consistency.

### 15. `send-kudos-input.tsx:28-35` — Search input is uncontrolled / visual-only
The search `<input>` has no `value` or `onChange`. It is deliberately "visual only" (comment confirms). Fine for a demo; the `aria-label` is present so it is not an a11y hole.

### 16. `widget-button.tsx` — Missing `aria-expanded`
The floating action button at line 29 toggles a menu but does not set `aria-expanded={open}`. Screen reader users cannot detect the open/closed state.

---

## Positive Observations

- **Countdown timer** (`countdown-timer.tsx`): SSR/hydration mismatch is handled correctly — placeholder `"--"` rendered server-side, real value set after `useEffect`. Interval cleanup is correct. No memory leak.
- **next/image with data: URLs** (`kudos-image-gallery.tsx`): Next.js 16 auto-bypasses image optimization for `data:` src (confirmed in `get-img-props.js:270`). The `<Image>` usage is safe without `unoptimized`.
- **Optimistic like with per-card pending** (`kudos-board-context.tsx:71`): Per-card `pendingIds` set prevents one card's network call from blocking another. Rollback on failure is implemented.
- **IntersectionObserver cleanup** (`awards-information-nav.tsx`): `observer.disconnect()` in cleanup, scroll timer cleared on unmount — no leaks.
- **Click-outside pattern** (`hashtag-picker.tsx`, `recipient-select.tsx`): Uses `mousedown` (not `click`) to prevent race with the button's own `onClick` — correct technique.
- **Server-side validation** (`actions.ts`): `assertValidCreateKudosInput` mirrors client rules via shared `compose-validation.ts`. No client-only gate.
- **Context null-safety**: `useKudosBoard` throws on missing provider; `useComposeModal` gracefully degrades with a NOOP context — both are intentional and documented.
- **DRY**: Image/hashtag caps are constants in `compose-validation.ts`, consumed by both client and server — clean single source of truth.

---

## Unresolved Questions

1. **`KudosImageGallery` displaying data URLs in the feed**: Images are stored as data URLs in the DB (`image_urls: string[]`). For real posts those could be large (up to 2 MB × 5 = 10 MB). Is there a plan to store to object storage and serve URLs before GA?
2. **`toggleKudosLike` accepts `userId` from client** (`actions.ts:33`): The server action trusts the caller-supplied `userId` (TODO(auth) comment is there). Confirm this is gated behind the demo-only boundary and will not reach production as-is.
3. **Hardcoded locale path in `revalidateBoard`** (`actions.ts:26-28`): `revalidatePath("/vi/sun-kudos")` and `/en/sun-kudos` are hardcoded. If locales change, cache invalidation silently breaks. Consider deriving from the i18n config.
