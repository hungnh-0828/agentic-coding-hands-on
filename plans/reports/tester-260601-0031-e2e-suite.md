# E2E Test Suite Report

**Date:** 2026-06-01  
**Test Runner:** Playwright (Chrome)  
**Command:** `npm run test:e2e`  
**Duration:** ~12-16s  

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 14 |
| Passed | 5 |
| Failed | 9 |
| Skipped | 0 |
| Success Rate | 36% |

---

## Test Results by File

### e2e/auth.spec.ts (2/5 failed)

**Passed:**
- ✓ "en locale: login → redirected to /en home"

**Failed:**
1. **Line 9:** "vi locale: login → redirected to /vi home"
   - **Error:** Missing img element with alt="ROOT FURTHER"
   - **Root Cause:** Image not visible after redirect, likely due to page not rendering completely or image load delay
   - **Stack:** `/e2e/auth.spec.ts:14:67`

2. **Line 39:** "after login, client-nav to /vi/sun-kudos renders kudos page (no reload)"
   - **Error:** `Test timeout 30000ms exceeded` waiting for link "Sun* Kudos"
   - **Root Cause:** Link not found in DOM or hidden; strict mode violation likely (duplicate links in header + footer)
   - **Stack:** `/e2e/auth.spec.ts:46:58`

**Protected Route Tests (2 tests):**
- **BLOCKED:** Tests assert auth guard redirects unauthenticated users to login, but pages are **NOT redirecting** — they render with "redirecting..." placeholder
  - `vi/sun-kudos` expected → `/vi/login`, received → `/vi/sun-kudos` (timeout 10s)
  - `en/awards-information` expected → `/en/login`, received → `/en/awards-information` (timeout 10s)
  - **Root Cause:** AuthGuard client-side redirect effect not triggering; possible router issue or race condition

---

### e2e/kudos.spec.ts (0/3 failed)

All tests blocked in beforeEach hook due to link click issue:

**Failed (all in beforeEach):**
1. **Line 29:** "board renders banner image and title"
   - **Error:** `goToKudosBoard()` → `page.getByRole('link', { name: 'Sun* Kudos' }).click()` timed out
   - **Root Cause:** Strict mode violation: link selector resolved to 2 elements (header + footer)
   - **Stack:** `/e2e/kudos.spec.ts:19:54`

2. **Line 37:** "compose modal opens when send-kudos button is clicked"
   - **Error:** Same as above in beforeEach
   - **Stack:** `/e2e/kudos.spec.ts:19:54`

3. **Line 48:** "compose modal closes when Escape is pressed"
   - **Error:** Same as above in beforeEach
   - **Stack:** `/e2e/kudos.spec.ts:19:54`

---

### e2e/navigation.spec.ts (3/6 failed)

**Passed:**
- ✓ "vi → en: URL changes to /en and en-only content appears"
- ✓ "en → vi: URL changes to /vi and vi-only content appears"

**Failed:**
1. **Line 23:** "GET / redirects to /vi"
   - **Error:** `toHaveURL(/\/vi$/)` failed; received `http://localhost:3000/en`
   - **Root Cause:** Root redirect logic not working; redirecting to `/en` instead of `/vi`. Likely issue in `i18n/routing.ts` or middleware logic
   - **Stack:** `/e2e/navigation.spec.ts:25:24`

2. **Line 30:** "hero image is visible on /vi"
   - **Error:** Locator strict mode violation: `getByRole('img', { name: 'ROOT FURTHER' })` resolved to **2 elements**
     - Element 1: In hero section (with `decoding="async"`)
     - Element 2: In root-further section (with `loading="lazy"`)
   - **Root Cause:** ROOT FURTHER image appears twice on the page; test needs specificity (e.g., within hero section) or should explicitly scope to first/visible element
   - **Stack:** `/e2e/navigation.spec.ts:32:67`

3. **Line 73:** "Sun* Kudos link navigates away from home"
   - **Error:** `getByRole('link', { name: 'Sun* Kudos' }).click()` strict mode violation: **2 elements found**
     - Element 1: Header nav
     - Element 2: Footer nav
   - **Root Cause:** Same link text appears in both header and footer; test cannot disambiguate
   - **Stack:** `/e2e/navigation.spec.ts:76:58`

4. **Line 83:** "logo link returns to locale home"
   - **Error:** `getByRole('link', { name: 'Sun* Annual Awards — Home' }).click()` strict mode violation: **2 elements found**
     - Element 1: Header logo
     - Element 2: Footer logo
   - **Root Cause:** Logo link appears twice (header + footer); test cannot disambiguate
   - **Stack:** `/e2e/navigation.spec.ts:86:73`

---

## Critical Issues

### 1. Strict Mode Violations (4 tests)
**Symptom:** `getByRole()` resolves to multiple elements (header + footer)  
**Impact:** Navigation and kudos tests cannot click links  
**Fix Strategy:** Tests should narrow selectors (e.g., `getByRole('banner').getByRole('link')`) or use `.first()` / `.nth(0)`

### 2. Protected Route Guard Not Working (2 tests)
**Symptom:** Direct navigation to `/vi/sun-kudos` and `/en/awards-information` does NOT redirect to login  
**Expected:** AuthGuard should redirect unauthenticated users to `/login`  
**Actual:** Pages render with placeholder text  
**Root Cause:** Client-side effect in `AuthGuard` not triggering router.replace() — possible issues:
- Mock auth context not initialized before page renders
- Router not available in render cycle
- Race condition between page load and useEffect cleanup

**Fix Strategy:**
- Check if MockAuthProvider is wrapping all page content
- Verify useRouter() is resolving before useEffect runs
- Consider moving auth check earlier (e.g., middleware or Server Component guard)

### 3. Root Redirect Broken (1 test)
**Symptom:** `GET /` redirects to `/en` instead of `/vi`  
**Expected:** Redirect to `/vi` (default locale)  
**Actual:** Redirects to `/en`  
**Root Cause:** Likely in `i18n/routing.ts` or middleware not properly detecting/setting default locale  
**File:** Check `/lib/i18n/routing.ts` and `next.config.ts` for locale routing config

### 4. Duplicate Element Rendering (2 tests)
**Symptom:** ROOT FURTHER image appears twice on page  
**Impact:** `getByRole('img', { name: 'ROOT FURTHER' })` fails in strict mode  
**Root Cause:** Component rendering ROOT FURTHER in two locations (hero + root-further section)  
**Fix Strategy:** Either consolidate to single image or use nth(0) / within scope in test

---

## Dev Server Notes

**JSON Parse Errors in WebServer output:**
- Multiple `SyntaxError: Unexpected non-whitespace character after JSON at position 1002` warnings
- **Assessment:** Warnings from next-intl dynamic import of message files; both `vi.json` and `en.json` are valid (verified via Python `json.load()`)
- **Not blocking:** Tests run despite warnings; likely internal Next.js bundling artifact
- **Suggested investigation:** Check `lib/i18n/request.ts` line 14 — dynamic `import()` of JSON may need static import or proper export

---

## Coverage Gaps

**Untested Paths:**
- ✗ Admin dashboard page (`/[locale]/admin-dashboard`)
- ✗ Prelaunch page (`/[locale]/prelaunch`)
- ✗ About SAA 2025 page (`/[locale]/about-saa-2025`)
- ✗ Language switcher menu interactions (PASSED but only 2/2 of vi↔en tested)
- ✗ Protected routes with authenticated users (e.g., POST to create kudos)
- ✗ Responsive design (tests run at 1280×720; no mobile breakpoints)

---

## Recommendations

### Critical (Block Release)
1. **Fix AuthGuard redirect** — Protected routes must reject unauthenticated access
   - File: `lib/auth/auth-guard.tsx`
   - Check: MockAuthProvider wrapping, useEffect timing, router availability
   
2. **Fix root redirect** — `GET /` must route to `/vi`, not `/en`
   - File: `lib/i18n/routing.ts` or middleware
   - Check: defaultLocale config, middleware logic
   
3. **Narrow test selectors** — Fix strict mode violations
   - Update `e2e/auth.spec.ts:46`, `e2e/navigation.spec.ts:76,86`, `e2e/kudos.spec.ts:19`
   - Use `.first()` or scope to specific region (e.g., `getByRole('banner')`)

### Important
4. **Consolidate duplicate ROOT FURTHER image** — Or scope test to hero section only
5. **Add missing page tests** — Admin dashboard, prelaunch, about pages currently untested

### Nice-to-Have
6. **Test mobile viewports** — Responsive design validation
7. **Test authenticated CRUD** — Create/update/delete kudos flows
8. **Test error states** — Network failures, malformed input, edge cases

---

## Next Steps

1. **Diagnose auth guard:** Check mock context initialization order
2. **Fix root redirect:** Verify locale routing config
3. **Update selectors:** Scope to first element or region
4. **Re-run suite:** Expect 10-12/14 to pass after fixes
5. **Add new tests:** Admin, prelaunch, about pages + mobile viewport

---

**Status:** BLOCKED (9 failures prevent release)

**Unresolved Questions:**
- Why does `JSON.parse()` error appear in dev server if both JSON files are valid?
- Is MockAuthProvider correctly wrapping the entire page tree before first render?
- What sets the default locale in root redirect — middleware, routing config, or browser language header?
