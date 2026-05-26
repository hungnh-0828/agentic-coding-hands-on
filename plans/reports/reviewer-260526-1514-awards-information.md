# Code Review — Awards Information Page (SAA 2025)

**Date:** 2026-05-26
**Commits:** `6844b4b` + `92fee7d`
**Reviewer:** Staff Engineer (reviewer agent)

---

## Code Review Summary

### Scope
- Files: 9 (page, 4 components, auth-guard, types, 2 i18n, 1 migration, seed)
- LOC: ~318 (all files under 200-line limit individually)
- Focus: correctness, memory/leaks, a11y, i18n, architecture, schema delta, Next.js 16 patterns

### Overall Assessment

Solid, well-structured implementation. The scroll-spy logic is careful, the SSR/CSR boundary is correctly handled with `typeof window` guard, and migration is idempotent. No critical security issues. A handful of correctness nits and one semantic HTML issue worth fixing before ship.

---

## Critical Issues

None.

---

## High Priority

### H1 — `aria-current="true"` should be `aria-current="page"` (semantic error)

**File:** `components/awards-information/awards-information-nav.tsx:74`

```tsx
// Current (wrong for nav links):
aria-current={isActive ? "true" : undefined}

// Correct:
aria-current={isActive ? "location" : undefined}
```

`aria-current="true"` is not a recognized value; screen readers fall back to generic behavior. For in-page anchor navigation the correct token is `"location"` (the active position in a document). `"page"` is for same-page navigation items in a site nav. Either is vastly better than `"true"`. TypeScript's JSX types for `aria-current` will accept `"location"`, `"page"`, `true` (boolean), etc. — switching from string `"true"` to proper token is low-risk.

### H2 — `history.replaceState` inside a click handler is not guarded against SSR

**File:** `components/awards-information/awards-information-nav.tsx:56`

```tsx
history.replaceState(null, "", `#${slug}`);
```

`history` (without `window.`) is a bare global. In a `"use client"` component this is fine at runtime, but if Next.js ever calls the click handler during RSC streaming or the component is unit-tested in a Node environment it will throw `ReferenceError: history is not defined`. The first `useEffect` already uses `typeof window === "undefined"` guard — apply the same pattern here, or write `window.history.replaceState(...)` for clarity and consistency.

---

## Medium Priority

### M1 — `dl` structure has two `<dd>` per term without semantic grouping

**File:** `components/awards-information/award-detail-block.tsx:36-54`

```tsx
<div className="flex flex-wrap items-baseline gap-2">
  <dt>Số lượng:</dt>
  <dd>10</dd>        {/* value */}
  {unitLabel && <dd>Đơn vị</dd>}   {/* unit — second dd for same dt */}
</div>
```

Two `<dd>` elements for a single `<dt>` is valid HTML but ambiguous to AT. The unit label is semantically modifier text, not a second definition. Options:
- Combine into one `<dd>`: `{String(prizeCount).padStart(2, "0")}{unitLabel ? ` ${unitLabel}` : ""}`
- Or use `<span>` inside the single `<dd>` for the unit.

### M2 — Scroll-spy fires only on `entries` delivered in that callback batch

**File:** `components/awards-information/awards-information-nav.tsx:37-41`

```tsx
const visible = entries
  .filter((e) => e.isIntersecting)
  .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
const top = visible[0];
if (top?.target.id) setActiveSlug(top.target.id);
```

`entries` in a single callback only contains elements whose intersection state **changed** in that frame — not all currently-intersecting elements. If the user scrolls slowly, only one section's entry fires at a time. The sort-by-ratio logic works correctly for that single entry, but if two sections change intersection simultaneously, picking by ratio is correct. The real edge case: when the user scrolls up quickly and a section leaves + another enters in the same frame, only one `setActiveSlug` call fires (the highest-ratio one from that batch) — which is the intended behavior. This is actually fine as-is, but the code comment implies "all visible sections compete", which is misleading. Consider rewording or keeping a persistent `intersecting` Set ref if future requirements need more precision.

**Impact:** Minor UX glitch possible but not a crash or data issue.

### M3 — `setTimeout` return value not stored; cannot be cleared on fast re-clicks

**File:** `components/awards-information/awards-information-nav.tsx:59-61`

```tsx
window.setTimeout(() => {
  isManualScroll.current = false;
}, 800);
```

If user clicks a nav item again within 800ms (e.g., clicks link A, then B rapidly), two timers are pending. The first timer fires and sets `isManualScroll.current = false` while the second scroll is still in flight. Observer updates leak through during the 0–800ms window of the second scroll.

Fix: store the timer id and clear on each new click.

```tsx
const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// in handleClick:
if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
isManualScroll.current = true;
// ...
scrollTimerRef.current = window.setTimeout(() => {
  isManualScroll.current = false;
}, 800);
```

Also clear in useEffect cleanup for completeness (though unlikely to matter).

### M4 — Unused i18n key `perPrize` defined but never consumed

**Files:** `messages/vi.json:80`, `messages/en.json:80`

`"perPrize"` key is present in both locale files but never called with `t("perPrize")` anywhere in the codebase. Dead i18n keys accumulate translator cost and cause confusion. Either use it or remove it.

### M5 — `AwardRow` type in `page.tsx` duplicates `Database["public"]["Tables"]["awards"]["Row"]`

**File:** `app/[locale]/awards-information/page.tsx:15-24`

A local `AwardRow` type is manually defined with a subset of the DB row fields. This diverges from the canonical `Database` type in `lib/supabase/types.ts`. If a column is renamed in the DB/types, `AwardRow` silently drifts.

Fix: derive it from the canonical type:

```ts
import type { Database } from "@/lib/supabase/types";
type AwardRow = Pick<
  Database["public"]["Tables"]["awards"]["Row"],
  "id" | "slug" | "title" | "description" | "display_order" | "prize_count" | "unit_label" | "prize_value"
>;
```

---

## Nit

### N1 — `awards-information-banner.tsx` uses a hardcoded English string for `aria-label`

**File:** `components/awards-information/awards-information-banner.tsx:7`

```tsx
aria-label="Keyvisual Sun* Annual Award 2025"
```

This is a server component that already has `next-intl` loaded. The label should come from `t("banner.ariaLabel")` (add key) for full bilingual support on the section landmark. Low impact for English users but inconsistent with the project's i18n pattern.

### N2 — Seed does not update `title` on conflict

**File:** `supabase/seed.sql:34-39`

The `ON CONFLICT (slug) DO UPDATE` list omits `title = excluded.title`. If a title is corrected in the seed, re-running the seed will silently keep the old title in the DB. Not a bug now (titles haven't changed), but fragile for future edits.

### N3 — `AwardsInformationHeader` uses `awardsInfo.caption` — same string as homepage `awards.caption`

**Files:** `messages/vi.json:75` and `messages/vi.json:40`

Both `awardsInfo.caption` and `awards.caption` have identical value `"Sun* annual awards 2025"` in both locales. If the detail page caption evolves independently, having them as separate keys is correct. If they're intentionally the same, one could reference the other (not possible in `next-intl` without custom helpers), so the duplication is acceptable as-is — just flag for translator awareness.

---

## Edge Cases Found

1. **Deep-link before DOM paint:** The hash-seed `useEffect` (line 16-24 in nav) runs before the IntersectionObserver effect (line 26-48). Between first render and observer attachment there's a brief window where `activeSlug` is set from hash but no sections are observed yet. On fast machines this is imperceptible; on slow connections with SSR the nav might briefly highlight the hash-linked item then "reset" if the observer fires immediately. Not a crash, acceptable behavior.

2. **Empty `items` array:** If `fetchAwards()` returned FALLBACK but FALLBACK were somehow empty (it's hardcoded, so impossible today), the nav would render an empty `<ul>` and the observer `if (elements.length === 0) return;` guard would prevent observer setup entirely — correct defensive behavior.

3. **`isAuthenticated` starts `false` on every SSR hydration** (by design, mock context initializes to `false`). This means there is a guaranteed flash of "Đang chuyển hướng..." on every page load until the client-side auth state hydrates. This is the known mock-auth limitation, but it also means the redirect fires via `router.replace('/login')` on every unauthenticated load — confirmed as acceptable in clarifications.

4. **No `key` on `<li>` inside the `<dl>` term groups** in `award-detail-block.tsx` — actually fine since those are not in a `.map()`.

---

## Positive Observations

- IntersectionObserver cleanup on unmount (`return () => observer.disconnect()`) is correctly implemented — no leak.
- `typeof window === "undefined"` guard in the hash-seed effect is correct and necessary.
- `fetchAwards()` gracefully falls back to FALLBACK on any DB error; the catch block is not silently swallowed (it returns useful data).
- Migration uses `add column if not exists` — fully idempotent, safe to run multiple times.
- Seed uses `ON CONFLICT (slug) DO UPDATE` — idempotent; schema delta + seed delta are self-consistent.
- `generateMetadata` correctly awaits `params` (Next.js 16 async params pattern) — no deprecated sync access.
- File sizes all well under 200-line limit; component boundaries are clean and single-responsibility.
- `whitespace-pre-line` on prize value renders the `\n`-separated multi-line string (signature-creator) correctly without a `dangerouslySetInnerHTML`.

---

## Recommended Actions

1. **(H1, must)** Change `aria-current="true"` → `aria-current="location"` in `awards-information-nav.tsx:74`
2. **(H2, should)** Change bare `history.replaceState` → `window.history.replaceState` for explicitness/safety in `awards-information-nav.tsx:56`
3. **(M3, should)** Store and clear the `setTimeout` ref on rapid re-clicks in `awards-information-nav.tsx:59-61`
4. **(M1, should)** Merge the two `<dd>` for prize count + unit into one `<dd>` in `award-detail-block.tsx:40-43`
5. **(M4, nice)** Remove unused `"perPrize"` key from both locale files
6. **(M5, nice)** Derive `AwardRow` from `Database` type to stay in sync
7. **(N2, future)** Add `title = excluded.title` to seed `ON CONFLICT` update list

---

## Metrics

- Type Coverage: ~95% (local `AwardRow` type is manually duplicated but correct; no `any` usage detected)
- Test Coverage: N/A (user opted out)
- Linting Issues: 0 blocking (build verified clean)

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is solid and production-ready with no critical issues. Two high-priority fixes are recommended before merge: `aria-current` wrong token (H1) and `setTimeout` race on rapid nav clicks (M3). The `history` bare global (H2) is low-risk in practice but worth fixing for consistency.
