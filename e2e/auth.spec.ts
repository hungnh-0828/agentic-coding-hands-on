import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

// Mock auth is CLIENT-SIDE in-memory React state.
// Every fresh page.goto() starts unauthenticated — no storage to clear.
// signIn() stays in the same tab so mock state survives client-side navigation.

test.describe("Auth — login flow", () => {
  test("vi locale: login → redirected to /vi home", async ({ page }) => {
    await signIn(page, "vi");
    // Reaching /vi without a bounce to /login proves auth state was set.
    await expect(page).toHaveURL(/\/vi(\/)?$/, { timeout: 10_000 });
    // Home page hero image is present — page rendered correctly.
    // ROOT FURTHER appears twice (hero + rootFurther section); use .first() to avoid strict-mode violation.
    await expect(page.getByRole("img", { name: "ROOT FURTHER" }).first()).toBeVisible();
  });

  test("en locale: login → redirected to /en home", async ({ page }) => {
    await signIn(page, "en");
    await expect(page).toHaveURL(/\/en(\/)?$/, { timeout: 10_000 });
  });
});

test.describe("Auth — guard blocks unauthenticated direct navigation", () => {
  test("vi/sun-kudos: fresh visit while unauth → redirected to /vi/login", async ({ page }) => {
    // Fresh page.goto is always unauthenticated (in-memory state, no storage).
    await page.goto("/vi/sun-kudos");
    // AuthGuard uses a client-side useEffect redirect; cold next dev compile can be slow.
    // Extended timeout accommodates the compile + effect timing without weakening the assertion.
    // Pin to the ORIGINATING locale: router.replace("/login") is locale-relative, so a
    // vi page must bounce to /vi/login — catches a cross-locale redirect regression.
    await expect(page).toHaveURL(/\/vi\/login\/?$/, { timeout: 15_000 });
  });

  test("en/awards-information: fresh visit while unauth → redirected to /en/login", async ({
    page,
  }) => {
    await page.goto("/en/awards-information");
    // Extended timeout for the same cold-compile + client-side redirect reason.
    // Pin to /en: an en page must bounce to /en/login, not cross to vi.
    await expect(page).toHaveURL(/\/en\/login\/?$/, { timeout: 15_000 });
  });
});

test.describe("Auth — authed client navigation preserves mock state", () => {
  test("after login, client-nav to /vi/sun-kudos renders kudos page (no reload)", async ({
    page,
  }) => {
    // Step 1: authenticate in the same tab — mock state lives in React context.
    await signIn(page, "vi");

    // Step 2: client-side navigate via the nav link — no page.goto, no reload.
    // Scope to banner landmark (header) to avoid matching the identical link in the footer.
    await page.getByRole("banner").getByRole("link", { name: "Sun* Kudos" }).click();

    // Step 3: URL must end up on sun-kudos, NOT bounce back to login.
    await expect(page).toHaveURL(/\/vi\/sun-kudos/, { timeout: 10_000 });

    // Step 4: kudos page rendered its banner (not AuthGuard's redirecting placeholder).
    await expect(page.getByRole("img", { name: "Sun* Kudos" })).toBeVisible();
  });
});
