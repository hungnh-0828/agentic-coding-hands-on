# Code Review — Countdown Prelaunch Page

**Date:** 2026-05-26
**Branch:** feat/countdown-prelaunch
**Reviewer:** reviewer agent

---

## Scope

| File | Status | LOC |
|------|--------|-----|
| `app/[locale]/prelaunch/page.tsx` | NEW | 40 |
| `components/hero/countdown-timer.tsx` | MODIFIED | 94 |
| `messages/vi.json` | MODIFIED | +1 key |
| `messages/en.json` | MODIFIED | +1 key |

---

## Verdict: APPROVE_WITH_FIXES

**Score: 7.5 / 10**

Overall the implementation is clean, minimal, and builds on the existing component correctly. Two actionable issues warrant a fix before merge: a double-`padStart` redundancy (logic bug risk under edge inputs) and missing a11y on digit `<span>` elements.

---

## Critical

None.

---

## Important

### 1. Double `padStart` — redundant and hides a real edge case

`pad(unit.value)` (line 54) already guarantees a 2-char string like `"07"` before passing to `LedDigitPair`. Inside `LedDigitPair` (line 81), `.padStart(2, "0")` is called again on that already-padded string — a no-op for normal values.

The real issue: when `ready === false`, the caller passes `"--"` (2 chars, no digits). `"--".padStart(2, "0")` is still `"--"`, so `split("")` yields `["-", "-"]` and each box renders `"-"`. That is actually fine visually, but the inner `padStart` call communicates misleading intent — it implies the function might receive a 1-char string, which it never does from this caller.

More importantly, if a third caller ever passes a single character (e.g., `"9"`), the inner `padStart` silently produces `"09"` instead of raising a type error. The prop type is `{ value: string }` with no constraint — this is a latent footgun.

**Fix:** Either tighten the prop type to enforce 2-char strings (a branded type or a narrower union like `"--" | \`${number}${number}\`` — though the latter is impractical) or remove the inner `padStart` and rely solely on the outer `pad()` + caller contract. The simplest safe fix:

```tsx
// Remove inner padStart — caller already pads
function LedDigitPair({ value }: { value: string }) {
  const [a, b] = value.split("");
  // ...
}
```

And add a comment near the call site: `// value is always 2 chars: pad() or "--"`.

### 2. Digit `<span>` elements have no a11y context

Each digit box is a bare `<span>` (lines 85–90) with no accessible label. Screen readers will announce individual characters — `"0"`, `"7"` — with no grouping or unit context. A user navigating by AT has no way to know these digits represent "07 DAYS".

The `<span>` label below each `LedDigitPair` (`"DAYS"`, `"HOURS"`, `"MINUTES"`) is a sibling of the digit box group, not a parent. AT will not associate them automatically.

**Fix:** Wrap the digit box group in a `role="group"` with `aria-label` combining value and unit, and add `aria-hidden` to the individual digit spans:

```tsx
// In CountdownTimer LED variant:
<div key={unit.label} className="flex flex-col items-center">
  <div
    role="group"
    aria-label={`${ready ? pad(unit.value) : "--"} ${unit.label}`}
  >
    <LedDigitPair value={ready ? pad(unit.value) : "--"} />
  </div>
  <span aria-hidden className="mt-4 text-sm font-bold uppercase tracking-[0.4em] text-saa-text">
    {unit.label}
  </span>
</div>
```

And within `LedDigitPair`, add `aria-hidden="true"` on each `<span>` so the group label is the single AT read-out.

---

## Nit

### 3. `key={i}` on stable array (low risk, bad habit)

`[a, b].map((digit, i) => <span key={i} ...>)` (line 86) — the array is always exactly 2 elements in a fixed order. The index key will never trigger a reconciliation bug here, but it's noise that linters flag and that trains bad habits when copy-pasted. Prefer `key={`digit-${i}`}` or simply `key={i === 0 ? "tens" : "ones"}`.

### 4. `hero.labels` namespace used in both variants — naming is acceptable but warrants a comment

`CountdownTimer` always calls `useTranslations("hero.labels")` regardless of variant (line 23). This is the KISS choice approved in the plan clarifications, but a developer landing on the LED variant will wonder why a "hero" namespace is used. A one-liner comment removes the surprise:

```tsx
// Both variants share hero.labels (DAYS / HOURS / MINUTES) — no separate prelaunch labels needed.
const t = useTranslations("hero.labels");
```

### 5. `eventISO` fallback duplicated in two server components

`process.env.NEXT_PUBLIC_EVENT_DATETIME ?? "2025-12-31T18:30:00+07:00"` appears verbatim in both `hero-section.tsx` (line 11) and `prelaunch/page.tsx` (line 26). The fallback date is a single source of truth that is now split. If the event date changes, both files need updating.

**Fix:** Extract to a shared constant:

```ts
// lib/event.ts
export const EVENT_ISO =
  process.env.NEXT_PUBLIC_EVENT_DATETIME ?? "2025-12-31T18:30:00+07:00";
```

Import in both components. DRY violation — low urgency but clean.

### 6. `setRequestLocale` called without `await params` guard in `generateMetadata`

In `prelaunch/page.tsx`, `generateMetadata` awaits `params` and calls `getTranslations` but does **not** call `setRequestLocale`. The page function does call it on line 22. This matches the pattern in `login/page.tsx` and `awards-information/page.tsx` (same omission there), so it is a pre-existing pattern — not a regression introduced by this diff. Noting for awareness: `setRequestLocale` is required by next-intl for static rendering to associate the locale with the request context. Its absence from `generateMetadata` can cause locale mismatch in metadata under concurrent requests in some next-intl versions. Out of scope for this diff, but worth a follow-up task.

---

## Strengths

- **Variant default is correct.** `variant = "hero"` at the destructure site (line 22) means `HeroSection`'s `<CountdownTimer eventISO={eventISO} />` (no variant prop) is unaffected — zero regression risk.
- **SSR hydration guard is preserved.** The `tick === null` placeholder (`"--"`) and the `useEffect`-driven first tick carry over cleanly to the LED branch. No hydration mismatch.
- **`LedDigitPair` correctly scoped.** At 94 lines total, the file stays well under the 200-line limit. Extracting `LedDigitPair` to its own file would be premature — it has no other consumers.
- **Next.js 16 async params pattern.** Both `generateMetadata` and the page component correctly `await params` before use — consistent with the rest of the codebase.
- **`generateStaticParams` not duplicated.** The prelaunch page correctly inherits from the `[locale]/layout.tsx` declaration — no redundant static param generation.
- **`aria-hidden` on decorative gradient overlay.** `div[aria-hidden]` on the background gradient in `prelaunch/page.tsx` (line 32) is correct.
- **i18n keys minimal and correct.** Adding only `prelaunch.title` to both locale files, with labels reusing `hero.labels.*` is the right KISS call — no naming confusion as long as the comment (Nit #4) is added.

---

## Recommended Actions (prioritized)

1. **(Important)** Fix a11y — add `role="group"` + `aria-label` wrapper on digit pairs, `aria-hidden` on individual digit spans.
2. **(Important)** Remove inner `padStart` from `LedDigitPair` or add a prop contract comment; as-is it is a latent confusion point.
3. **(Nit)** Extract shared `EVENT_ISO` constant to `lib/event.ts` — DRY.
4. **(Nit)** Add `// Both variants share hero.labels` comment on line 23.
5. **(Nit)** Replace `key={i}` with a semantic key in `LedDigitPair`.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is correct and regression-free; two Important issues (missing a11y on digit boxes, double-padStart confusion) should be fixed before merge. No critical bugs found.
