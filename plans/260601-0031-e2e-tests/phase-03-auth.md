# Phase 3 — Auth (login + guard)

**Priority:** P2 · **Status:** completed · **Blocked by:** Phase 1

Owns: `e2e/auth.spec.ts`. Uses `signIn` helper from Phase 1.

## Selectors / facts

- Login CTA button name: `LOGIN With Google` (same vi+en). While loading, label becomes `Signing in...`/`Đang đăng nhập...` and `aria-busy=true` — do NOT assert on that (timing-sensitive).
- On success: `LoginForm` effect `router.replace("/")` → `/{locale}`. 800ms mock delay.
- Guard: visiting `/{locale}/sun-kudos` (or `/awards-information`) while unauth → `router.replace("/login")` → `/{locale}/login`. During redirect, page shows `awardsInfo.redirectingToLogin` text.
- Mock auth is in-memory: a fresh `page.goto` to a protected URL is always unauthenticated.

## Test cases (e2e/auth.spec.ts)

1. **login flow → home**: `await signIn(page, "vi")` (helper asserts URL `/vi`). Then assert authenticated home: `expect(getByRole("img",{name:"ROOT FURTHER"})).toBeVisible()`. (Reaching `/vi` without bounce proves auth state set.)
2. **login en locale**: `signIn(page,"en")` → `toHaveURL(/\/en$/)`.
3. **guard blocks direct protected visit (vi)**: fresh context, `page.goto("/vi/sun-kudos")` → `expect(page).toHaveURL(/\/vi\/login/, { timeout: 10_000 })`.
4. **guard blocks direct protected visit (en, awards)**: `page.goto("/en/awards-information")` → `toHaveURL(/\/en\/login/)`.
5. **authed nav into protected page works (same tab)**: `signIn(page,"vi")` → click `getByRole("link",{name:"Sun* Kudos"})` → `toHaveURL(/\/vi\/sun-kudos/)` and NOT redirected to login (assert kudos banner heading visible, see Phase 4 selector). Proves client nav preserves mock state. No reload.

## Success criteria

5 cases green. Login awaited via `toHaveURL` (no `waitForTimeout`). Guard tests use fresh `page.goto` (unauth). Case 5 never reloads.

## Risks

- 800ms delay: `toHaveURL` timeout must exceed it — use 10_000. Mitigated in helper.
- If Playwright reuses storage between tests, mock auth is in-memory (React state), not storage — each new page starts unauth automatically. Good for guard tests; ensure case 5 runs in one page without `goto` reload.
