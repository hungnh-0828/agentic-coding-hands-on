# Code Review — Login Screen (Mock Google OAuth)

**Date:** 2026-05-26
**Reviewer:** reviewer agent
**Commit base:** `6844b4b` (Homepage SAA)

---

## Scope

| File | LOC | Type |
|------|-----|------|
| `app/[locale]/login/page.tsx` | 28 | Server component |
| `components/login/login-header.tsx` | 18 | Server component |
| `components/login/login-hero.tsx` | 19 | Server component |
| `components/login/login-form.tsx` | 77 | Client component |
| `messages/vi.json` | +8 keys | i18n |
| `messages/en.json` | +8 keys | i18n |

Total new LOC: ~150. All files well under the 200-line guideline.

---

## 1. Verdict

**APPROVE_WITH_FIXES**

---

## 2. Score

**8.5 / 10**

Below auto-approve threshold (9.5) due to one unhandled memory-leak (setTimeout not cleaned up on unmount) and one missing ARIA label on the sign-in button.

---

## 3. Critical Issues

None (no data loss, no auth bypass, no injection vector).

---

## 4. Important (Should Fix)

### 4.1 setTimeout not cleaned up — memory leak / stale-closure side-effect [warning]

**File:** `components/login/login-form.tsx` — `handleGoogleSignIn`

```ts
setTimeout(() => {
  signIn("regular");
}, MOCK_OAUTH_DELAY_MS);
```

If the component unmounts (e.g. fast navigation, parent rerenders) before the 800 ms fires, the callback still executes: `signIn` is called on an unmounted context. In the mock it is harmless now, but it sets a bad pattern and will cause React state-update-on-unmounted-component warnings if `setLoading` is ever moved inside the callback.

**Fix:**

```ts
const handleGoogleSignIn = () => {
  if (loading) return;
  setLoading(true);
  const id = setTimeout(() => {
    signIn("regular");
  }, MOCK_OAUTH_DELAY_MS);
  return () => clearTimeout(id);   // not possible from an event handler directly
};
```

Because `handleGoogleSignIn` is a click handler (not a `useEffect`), the canonical fix is a `useEffect` with the timer, or tracking the timer id in a `useRef` and clearing it in a cleanup `useEffect`:

```ts
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleGoogleSignIn = () => {
  if (loading) return;
  setLoading(true);
  timerRef.current = setTimeout(() => {
    signIn("regular");
  }, MOCK_OAUTH_DELAY_MS);
};

useEffect(() => {
  return () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
  };
}, []);
```

### 4.2 Sign-in button has no accessible label for screen readers [warning]

**File:** `components/login/login-form.tsx` — `<button>`

The button contains `<GoogleIcon aria-hidden>` + a `<span>` with translated text, so the text label is readable. However the button itself has no `aria-label` and no `role`, and the translated text renders inside a `<span>` which is fine **only if** the span text is always present. During the loading state the span renders `t("loading")` — that is fine. However, the loading `<Spinner>` SVG is `aria-hidden`, so the accessible name during loading is just the translated "Đang đăng nhập..." / "Signing in..." span text — which is correct. No `aria-label` strictly required here, BUT the `disabled` attribute alone does not communicate "busy" state to screen readers.

**Recommended fix:** add `aria-busy={loading}` to the button:

```tsx
<button
  type="button"
  onClick={handleGoogleSignIn}
  disabled={loading}
  aria-busy={loading}
  ...
>
```

---

## 5. Nit (Optional)

### 5.1 `loading` guard is a guard-clause, not a disabled-attribute guard — double protection is redundant but harmless [suggestion]

```ts
const handleGoogleSignIn = () => {
  if (loading) return;   // ← redundant because button is disabled={loading}
  ...
```

The `disabled` attribute already prevents `onClick` from firing in standard browsers. The guard is fine as a defensive measure — just worth noting it is belt-and-suspenders.

### 5.2 `alreadyAuthed` paragraph not wrapped in `role="status"` [suggestion]

**File:** `components/login/login-form.tsx` line 33

```tsx
<p className="mt-10 text-sm text-saa-muted">{t("alreadyAuthed")}</p>
```

This paragraph appears when `isAuthenticated` is true — it is a transient status message that immediately gives way to a redirect. Adding `role="status"` would have screen readers announce it without requiring focus:

```tsx
<p role="status" className="mt-10 text-sm text-saa-muted">{t("alreadyAuthed")}</p>
```

### 5.3 `login.title` key defined in both JSON files but never consumed in reviewed components [suggestion]

Both `vi.json` and `en.json` contain `"login": { "title": "Đăng nhập" / "Sign in" }`. No component in this diff uses `t("title")`. Either consume it (e.g. as `<title>` metadata via `generateMetadata`) or remove it to avoid dead keys accumulating.

### 5.4 `h1` in `login-hero.tsx` has no locale-specific text — "ROOT FURTHER" is hardcoded [suggestion]

```tsx
<span className="block ...">ROOT FURTHER</span>
```

This is a brand name so hardcoding is defensible, but the other brand heading on the homepage is also hardcoded this way, so it is consistent. No action required unless localisation of the brand name ever becomes a requirement.

---

## 6. Strengths

- **Race condition on rapid clicks** is correctly handled: `if (loading) return` + `disabled={loading}` form a two-layer guard. No double-submit path exists.
- **Already-authed redirect** uses `useEffect` with `[isAuthenticated, router]` dependency array — correct pattern. The synchronous `if (isAuthenticated) return <p>` guard below the hook prevents any flash of the sign-in button before the effect fires on first render.
- **Hydration safety**: `LoginForm` is `"use client"` and reads from context (client-only). No SSR value is used that could diverge — correct. The `isAuthenticated` initial value (`false`) is stable on both server/client passes.
- **setRequestLocale placement**: called before any async work in `LoginPage` — correct per next-intl docs.
- **params awaited**: `const { locale } = await params` — correct Next.js 16 pattern.
- **File sizes**: all components are well under 200 lines; each has a single responsibility.
- **i18n completeness**: all visible strings (welcome text, CTA, loading state, already-authed message) are translated in both locales with consistent key structure.
- **`aria-hidden` on decorative SVGs**: both `GoogleIcon` and `Spinner` carry `aria-hidden` — correct.
- **`aria-hidden` on decorative radial gradient div** in `page.tsx`: correct.
- **Security (mock auth)**: no server-side state to bypass, no JWT forgery surface. Client-only mock state resets on page reload — unauthenticated access to protected routes would be enforced at the real auth layer (out of scope for this diff).

---

## Recommended Actions (Prioritised)

1. **(Should fix)** Add `useRef` + `useEffect` cleanup for the `setTimeout` in `login-form.tsx` (§4.1).
2. **(Should fix)** Add `aria-busy={loading}` to the button (§4.2).
3. **(Optional)** Add `role="status"` to the `alreadyAuthed` paragraph (§5.2).
4. **(Optional)** Remove or consume the unused `login.title` key (§5.3).

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Login screen is well-structured and correctly handles the happy path, race conditions, and hydration. Two issues should be addressed before the next iteration: the `setTimeout` is not cleaned up on unmount (memory/stale-closure risk) and the button is missing `aria-busy` during the loading state.
**Concerns:** §4.1 (setTimeout cleanup) and §4.2 (aria-busy) are not blocking for a mock-only screen but should be fixed before the real OAuth wiring lands.
