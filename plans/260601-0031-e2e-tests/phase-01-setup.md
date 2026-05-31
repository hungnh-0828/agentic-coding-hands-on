# Phase 1 — Setup

**Priority:** P1 (blocks all) · **Status:** completed

Blocks: 2, 3, 4. Owns: `package.json`, `playwright.config.ts`, `e2e/helpers/auth.ts`, `.gitignore`.

## Steps

1. Install: `npm i -D @playwright/test && npx playwright install chromium`
2. Add script to `package.json`: `"test:e2e": "playwright test"`.
3. Create `playwright.config.ts` (root):

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

4. Create `e2e/helpers/auth.ts` — client-side sign-in helper (stays same tab so in-memory mock state survives):

```ts
import { type Page, expect } from "@playwright/test";

// Drives the real login button; mock OAuth delay is 800ms then redirect to "/" (locale-resolved).
export async function signIn(page: Page, locale: "vi" | "en" = "vi") {
  await page.goto(`/${locale}/login`);
  await page.getByRole("button", { name: "LOGIN With Google" }).click();
  // After signIn(), LoginForm effect does router.replace("/") → /{locale}.
  await expect(page).toHaveURL(new RegExp(`/${locale}(/)?$`), { timeout: 10_000 });
}
```

5. Add to `.gitignore`: `/test-results/`, `/playwright-report/`, `/.playwright/`.
6. Verify config compiles: `npx tsc --noEmit` (or `npx playwright test --list`).

## Test-case checklist

- [x] `@playwright/test` in devDependencies; Chromium installed.
- [x] `npm run test:e2e` resolves (lists specs even before any spec exists is fine once specs land).
- [x] `playwright.config.ts` typechecks; webServer + baseURL set.
- [x] `signIn` helper exists and uses role selector only.

## Success criteria

`npx playwright test --list` runs without config error. No source files under `app/`, `components/`, `lib/` modified.

## Risks

- Cold dev boot > 120s on first `next dev` compile → raise webServer timeout to 180_000 if needed.
- Fallback if `next dev` flakes: switch command to `"next build && next start"` and run build once before. Document only; don't pre-optimize (YAGNI).
