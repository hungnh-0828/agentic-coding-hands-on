import { type Page, expect } from "@playwright/test";

// Drives the real login button; mock OAuth delay is 800ms then redirect to "/" (locale-resolved).
// Stays in the same tab so the in-memory mock auth state survives for subsequent navigation.
export async function signIn(page: Page, locale: "vi" | "en" = "vi") {
  await page.goto(`/${locale}/login`);
  await page.getByRole("button", { name: "LOGIN With Google" }).click();
  // After signIn(), LoginForm effect does router.replace("/") → /{locale}.
  await expect(page).toHaveURL(new RegExp(`/${locale}(/)?$`), { timeout: 10_000 });
}
