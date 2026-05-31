import { test, expect } from "@playwright/test";

import { signIn } from "./helpers/auth";

// Exact strings from messages/vi.json — kudos namespace
const VI = {
  bannerTitle: "Hệ thống ghi nhận và cảm ơn",
  sendInputPlaceholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
  modalTitle: "Gửi lời cám ơn và ghi nhận đến đồng đội",
  navLink: "Sun* Kudos",
} as const;

/**
 * Navigate to /vi/sun-kudos client-side, preserving the in-memory auth state
 * that was established by signIn(). A hard page.goto() would start a fresh
 * server render, which bypasses the in-memory mock and bounces to /vi/login.
 */
async function goToKudosBoard(page: import("@playwright/test").Page) {
  // Scope to the banner landmark (header) to avoid matching the identical link in the footer,
  // which would cause a strict-mode violation (2 elements found).
  await page.getByRole("banner").getByRole("link", { name: VI.navLink }).click();
  await expect(page).toHaveURL(/\/vi\/sun-kudos/, { timeout: 10_000 });
}

test.describe("Kudos board (vi locale)", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, "vi");
    await goToKudosBoard(page);
  });

  test("board renders banner image and title", async ({ page }) => {
    // Banner logo image: alt="Sun* Kudos" (KudosBanner <Image alt="Sun* Kudos">)
    await expect(page.getByRole("img", { name: "Sun* Kudos" })).toBeVisible();

    // Banner title text from kudos.banner.title in vi.json.
    // Scope to main: the same string also appears in Next's invisible #__next-route-announcer__ aria-live region.
    await expect(page.getByRole("main").getByText(VI.bannerTitle)).toBeVisible();
  });

  test("compose modal opens when send-kudos button is clicked", async ({ page }) => {
    // SendKudosInput renders a <button> whose text is kudos.sendInput.placeholder
    const openBtn = page.getByRole("button", { name: VI.sendInputPlaceholder });
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // ComposeKudoModal: role="dialog" aria-modal="true" aria-label=kudos.compose.modalTitle
    const dialog = page.getByRole("dialog", { name: VI.modalTitle });
    await expect(dialog).toBeVisible();
  });

  test("compose modal closes when Escape is pressed", async ({ page }) => {
    // Open the modal first
    await page.getByRole("button", { name: VI.sendInputPlaceholder }).click();
    const dialog = page.getByRole("dialog", { name: VI.modalTitle });
    await expect(dialog).toBeVisible();

    // Esc handler in ComposeKudoModal calls close() → isOpen becomes false →
    // component returns null → element is removed from DOM (toBeHidden matches that).
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
