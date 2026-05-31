# E2E Test Suite Review — reviewer-260601-0058-e2e-tests

## Scope
- Files: `playwright.config.ts`, `e2e/global-setup.ts`, `e2e/helpers/auth.ts`, `e2e/navigation.spec.ts`, `e2e/auth.spec.ts`, `e2e/kudos.spec.ts`
- Cross-referenced: `components/header/site-header.tsx`, `components/site-footer.tsx`, `lib/auth/auth-guard.tsx`, `lib/auth/mock-auth-context.tsx`, `components/login/login-form.tsx`, `components/kudos/*`, `lib/i18n/routing.ts`, `proxy.ts`, `messages/{vi,en}.json`
- LOC: ~250 test lines + ~100 config/helper lines

**Score: 7.5 / 10**

---

## Overall Assessment

The suite is well-structured for a smoke-test scope. Selectors are role/text-based throughout, the global-setup warmup rationale is sound, assertions are generally honest, and the in-memory mock-auth model is correctly understood by every spec. Three issues below the CONCERN threshold keep the score from 9+: one locale-detection assumption that could produce a silent false-pass on CI, one tautological weak assertion, and one retries policy nuance.

---

## Critical Issues

None. No security, data-loss, or breaking-change defects.

---

## High Priority

### H1 — Root-redirect test does not actually verify the redirect mechanism (warning)

`navigation.spec.ts:23-29` — "GET / redirects to a locale-prefixed home" accepts `/vi` OR `/en`.

The middleware (`proxy.ts`) uses `next-intl/middleware` with `defaultLocale: "vi"` and header-based locale detection. Chromium sends `Accept-Language: en-US,en` by default, so in practice the test always lands on `/en` in CI. The assertion `/\/(vi|en)\/?$/` would pass even if the middleware were broken and returned a 200 on `/` (no redirect at all) — Playwright's `toHaveURL` resolves after navigation settles; if the server just serves `/` directly without redirecting, the URL would still be `/` (not matching the regex), so a redirect failure would be caught. However the test gives zero signal about *which* locale is chosen, and the comment says "Accept either locale" without noting that the `defaultLocale: "vi"` config should deterministically produce `/vi` when no `Accept-Language` header matches — but Chromium's `en` header overrides that. The real invariant (header detection overrides defaultLocale) is never asserted.

**Impact:** Low false-positive risk (a broken redirect would still fail the regex), but the test is weaker than it looks — it cannot distinguish "middleware routed correctly" from "middleware routed to wrong locale but to some locale".

**Fix:** Either pin locale detection expectations — `await expect(page).toHaveURL(/\/en(\/)?$/)` with a comment explaining Chromium's `Accept-Language: en` — or set `locale: 'vi'` in the browser context to make the test deterministic and verify the `defaultLocale` path independently. A deterministic test that actually asserts the expected locale is materially stronger.

---

### H2 — `auth.spec.ts` guard test locale regex is over-broad (warning)

`auth.spec.ts:30` and `:38`:
```ts
await expect(page).toHaveURL(/\/(vi|en)\/login\/?$/, { timeout: 15_000 });
```

The test navigates to `/vi/sun-kudos` and `/en/awards-information` respectively, then expects `/(vi|en)/login`. This accepts a cross-locale bounce (e.g., navigating `/vi/sun-kudos` → redirecting to `/en/login`). `AuthGuard` calls `router.replace("/login")` (locale-relative via next-intl), which should always stay in the same locale. The current regex would not catch a regression where the guard redirects to the wrong locale.

**Fix:** Tighten the regex to the originating locale:
```ts
// vi test:
await expect(page).toHaveURL(/\/vi\/login\/?$/, { timeout: 15_000 });
// en test:
await expect(page).toHaveURL(/\/en\/login\/?$/, { timeout: 15_000 });
```

---

## Medium Priority

### M1 — "hero image visible" is a near-tautological assertion (concern)

`navigation.spec.ts:37` and `auth.spec.ts:15`:
```ts
await expect(page.getByRole("img", { name: "ROOT FURTHER" }).first()).toBeVisible();
```

This fires on both the hero section and the `rootFurther` section images — both have `alt="ROOT FURTHER"`. The `.first()` dodge avoids a strict-mode error, but the selector is fragile: any page that renders *any* visible image with that alt text passes. The assertion does not confirm the hero section specifically; it would pass even if the hero section were replaced with an error state as long as the rootFurther section below rendered.

**Not a false-positive in the current codebase** — both images are on the same page and signal the home page rendered — but it provides weak confidence in isolation.

**Fix (nice-to-have):** Scope the selector: `page.getByRole("main").getByRole("img", { name: "ROOT FURTHER" }).first()` or add a section-level locator. Alternatively, assert a unique landmark: `await expect(page.getByRole("main")).toBeVisible()` alongside a heading check.

### M2 — Warmup swallows ALL fetch errors silently (concern)

`e2e/global-setup.ts:21-24`:
```ts
} catch {
  // Server may still be starting; warming is best-effort, tests retry anyway.
}
```

A typo in the ROUTES list (e.g., `/en/awards-informationn`) would silently produce a non-200 and not be caught. The catch block is correct for network-level errors (server not yet ready), but it also swallows HTTP 404s from route misspellings. If a warmed route was recently renamed, the warmup silently does nothing for it and the first test hitting that cold route relies entirely on the retry budget.

**Fix (low-lift):** Change the fetch to log (not throw) non-ok responses:
```ts
const res = await fetch(...);
if (!res.ok) console.warn(`[global-setup] warmup ${route} → ${res.status}`);
```
This preserves the best-effort behaviour while making route misspellings visible in the reporter output.

### M3 — `fullyParallel: true` + single warmup fetch per route may still race (concern)

`global-setup.ts` issues a single `fetch` per route with `redirect: "follow"`. A single fetch triggers server-side compilation but does NOT wait for the compilation to fully complete before returning — Next dev's compile happens asynchronously in the background after the first byte is received. Under high concurrency, the parallel suite can still hit a partially-compiled page.

**Impact:** Mitigated by `retries: 1`, so this is not a hard failure risk. But it means the warmup guarantee is weaker than documented — it is really "kick off compilation" not "ensure compilation is done".

**Fix (optional):** After the warmup fetch loop, optionally re-fetch the heaviest routes once to drain the in-flight compile queue, or document the limitation explicitly in the comment. Alternatively, use `waitForSelector` via a full Playwright browser in `globalSetup` for stricter guarantees (overkill for this scope).

---

## Low Priority / Refinements

### R1 — `test:e2e` script has no `--project=chromium` flag

`package.json` line 11: `"test:e2e": "playwright test"`. Config only defines one project (`chromium`), so this is harmless today. If a second project (mobile, Firefox) is added later, all projects run by default. Explicit `--project=chromium` documents intent.

### R2 — `proxy.ts` is misnamed for the actual file role

The file at `proxy.ts` is the Next.js middleware (exports `createMiddleware` and `config.matcher`). Playwright's task description and reviewer prompt call it `proxy.ts`. This is the actual source filename — no action needed for the tests, but worth flagging as a maintenance confusion risk (file name suggests a proxy layer, not Next-intl middleware).

### R3 — `site-footer.tsx` has a duplicate `/awards-information` link for "Standards"

Not a test issue, but while cross-checking footer link counts for strict-mode safety: `SiteFooter` renders `Sun* Kudos` as a link. `navigation.spec.ts:82` correctly scopes to `banner` landmark to avoid matching the footer's identical `Sun* Kudos` link — this is handled correctly. No action needed.

### R4 — No test covers the `en` locale kudos path

All kudos tests run under `/vi`. The `en` locale has a different `kudos.banner.title` (`"The thank-you board"` vs `"Hệ thống ghi nhận và cảm ơn"`) and different `sendInput.placeholder`. This is accepted smoke-test scope, not a gap, but worth noting for future expansion.

---

## Retries Verdict

**`retries: 1` is acceptable here, with one caveat.**

The sole purpose is absorbing the first-hit `next dev` on-demand compile latency — a genuine environmental variance, not a product flakiness signal. This is correctly documented in `playwright.config.ts:11`. The global warmup reduces but does not eliminate this need (see M3). In CI (`forbidOnly: true`), retries remain active; CI should set `PLAYWRIGHT_RETRIES=0` if the goal is zero-tolerance for flakes in gated pipelines. If the project later adds CI, this default should be revisited.

**Risk:** `retries: 1` could mask a genuine intermittent bug (e.g., a race condition in the compose modal that fails ~50% of the time). For a 14-test smoke suite the blast radius is low, but test authors should be aware that a "sometimes fails" product bug has a 50% chance of being absorbed by the retry.

---

## Testing Against `next dev` Trade-off

This is an explicit, acceptable trade-off for local DX and CI cold-start speed. Documented risks:
1. Dev-mode React error overlays and HMR can interfere with selectors in rare cases.
2. `next dev` does not tree-shake; bundle size and async boundary timing may differ from production.
3. Server Components may re-render differently under dev double-invoke (React StrictMode).

None of these represent a hard block for smoke tests. For a future gated pipeline, consider adding a separate `test:e2e:prod` script using `next build && next start` for release confidence.

---

## Positive Observations

- Role/aria selectors throughout — no `data-testid`, CSS classes, or XPath. Resilient to markup refactors.
- `signIn()` helper correctly models the mock-auth limitation (same-tab, in-memory, no storage).
- `beforeEach` in kudos spec correctly chains `signIn → goToKudosBoard`, keeping test setup DRY.
- i18n string constants extracted to a typed `VI` object at the top of `kudos.spec.ts` — a single source of truth linked to `messages/vi.json`.
- `page.getByRole("banner")` scoping to avoid footer-link strict-mode violations is the correct pattern and is applied consistently across all three spec files.
- `toBeHidden()` used for modal close (not `not.toBeVisible()`) — correctly handles element removal from DOM.
- `globalSetup` correctly uses `config.projects[0]?.use?.baseURL` fallback rather than hardcoding.
- `.gitignore` correctly excludes `test-results/`, `playwright-report/`, `.playwright/`, and `.playwright-mcp/`.

---

## Recommended Actions (priority order)

1. **(H2, must-fix before adding new guarded routes)** Tighten auth-guard redirect regexes to originating locale — prevents false passes on cross-locale redirect regressions.
2. **(H1, should-fix)** Pin root-redirect test to expected locale (`/en`) or parameterise with explicit `Accept-Language` context — makes the test deterministic and documents the middleware's locale-detection contract.
3. **(M2, quick-win)** Add `if (!res.ok) console.warn(...)` in `global-setup.ts` to surface route misspellings without changing the best-effort semantics.
4. **(CI gate)** When adding CI, set `PLAYWRIGHT_RETRIES=0` via env or a `--retries=0` flag in the CI script to prevent the retry budget from absorbing real product flakiness.

---

**Status: DONE_WITH_CONCERNS**
**Summary:** Suite is correct and passes cleanly. Two high-priority URL-regex weaknesses (H1, H2) could allow locale-routing regressions to pass silently; H2 in particular should be fixed before new guarded routes are added. No security or data-loss issues.
