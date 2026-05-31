import { test, expect } from "@playwright/test";

/**
 * Navigation + i18n E2E tests.
 *
 * Covers:
 *   1. Root redirect  (/ → /vi)
 *   2. Home renders   (/vi hero image visible)
 *   3. Locale switch  vi → en (URL + en-only heading)
 *   4. Locale switch  en → vi (URL + vi-only heading)
 *   5. Nav kudos link navigates away from home
 *   6. Logo link → home (same locale)
 *
 * Locale discriminators:
 *   EN home: awards section heading "Awards System"   (en.json awards.title)
 *   VI home: awards section heading "Hệ thống giải thưởng" (vi.json awards.title)
 *
 * Language switcher button text = locale.toUpperCase() → "VI" on /vi, "EN" on /en.
 * Menu items = locale.toUpperCase() → "VI" / "EN".
 */

test.describe("root redirect", () => {
  test("GET / redirects to a locale-prefixed home", async ({ page }) => {
    await page.goto("/");
    // next-intl detects Accept-Language; Chromium sends "en", so the redirect is
    // deterministic → /en. Pinning the locale catches a cross-locale routing
    // regression (e.g. an en browser wrongly landing on /vi).
    await expect(page).toHaveURL(/\/en\/?$/);
  });
});

test.describe("home page", () => {
  test("hero image is visible on /vi", async ({ page }) => {
    await page.goto("/vi");
    // ROOT FURTHER image appears twice on home (hero section + rootFurther section).
    // Use .first() to target the hero image and avoid strict-mode violation.
    await expect(page.getByRole("img", { name: "ROOT FURTHER" }).first()).toBeVisible();
  });
});

test.describe("language switcher", () => {
  test("vi → en: URL changes to /en and en-only content appears", async ({ page }) => {
    await page.goto("/vi");

    // Open the language menu — button label is the current locale uppercased ("VI")
    const langButton = page.getByRole("button", { name: /^VI$/i });
    await langButton.click();

    // Wait for the menu to appear, then click the EN menuitem
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem", { name: /^EN$/i }).click();

    await expect(page).toHaveURL(/\/en$/);

    // Confirm English locale: awards section heading only present in EN
    await expect(page.getByRole("heading", { name: "Awards System" })).toBeVisible();
  });

  test("en → vi: URL changes to /vi and vi-only content appears", async ({ page }) => {
    await page.goto("/en");

    // Open the language menu — button label is "EN" on /en
    const langButton = page.getByRole("button", { name: /^EN$/i });
    await langButton.click();

    // Wait for menu, then click VI
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("menuitem", { name: /^VI$/i }).click();

    await expect(page).toHaveURL(/\/vi$/);

    // Confirm Vietnamese locale: awards section heading only present in VI
    await expect(page.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeVisible();
  });
});

test.describe("header navigation", () => {
  test("Sun* Kudos link navigates away from home", async ({ page }) => {
    await page.goto("/vi");

    // Scope to the banner landmark (header) to avoid matching the identical link in the footer.
    await page.getByRole("banner").getByRole("link", { name: "Sun* Kudos" }).click();

    // Unauth users are redirected to login or land on /sun-kudos — either is valid.
    // We only assert the URL moved away from the root locale path.
    await expect(page).toHaveURL(/\/(vi|en)\/(sun-kudos|login)/);
  });

  test("logo link returns to locale home", async ({ page }) => {
    await page.goto("/en");

    // Scope to the banner landmark (header) to avoid matching the identical logo link in the footer.
    await page.getByRole("banner").getByRole("link", { name: "Sun* Annual Awards — Home" }).click();

    await expect(page).toHaveURL(/\/en$/);
  });
});
