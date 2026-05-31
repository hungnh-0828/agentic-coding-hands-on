# Phase 4 — Kudos board + compose modal

**Priority:** P2 · **Status:** completed · **Blocked by:** Phase 1

Owns: `e2e/kudos.spec.ts`. Must authenticate first (page is guarded). Backend may be dead → assert STRUCTURE only, never seeded data.

## Selectors / facts

- Reach board: `signIn(page,"vi")` then click `getByRole("link",{name:"Sun* Kudos"})` (client nav preserves auth). Direct `goto` would bounce to login.
- Board banner: `KudosBanner` renders logo image alt `Sun* Kudos` → `getByRole("img",{name:"Sun* Kudos"})`. Also banner `kudos.banner.title` text: vi "Hệ thống ghi nhận và cảm ơn" / en "The thank-you board".
- Compose trigger: `SendKudosInput` button labelled by `kudos.sendInput.placeholder`:
  - vi: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
  - en: "Who do you want to thank today?"
  → `getByRole("button",{ name: <placeholder> })`.
- Modal: `role="dialog"` `aria-modal="true"` aria-label = `kudos.compose.modalTitle`:
  - vi: "Gửi lời cám ơn và ghi nhận đến đồng đội" / en: "Send thanks and recognition to your teammate"
  → `getByRole("dialog",{ name: <modalTitle> })`.
- Close: Esc key (handler) OR backdrop click OR Cancel button `kudos.compose.cancel` (vi "Hủy" / en "Cancel"). Use Esc (most robust): `page.keyboard.press("Escape")`.
- Search input (always present): `getByRole("searchbox",{ name: <searchPlaceholder> })` — optional structural check.

## Test cases (e2e/kudos.spec.ts) — run in vi

1. **board renders**: auth + nav to `/vi/sun-kudos`; `expect(getByRole("img",{name:"Sun* Kudos"})).toBeVisible()`; `expect(getByText("Hệ thống ghi nhận và cảm ơn")).toBeVisible()`.
2. **compose modal opens**: click send-kudos button (placeholder name) → `expect(getByRole("dialog",{name:"Gửi lời cám ơn và ghi nhận đến đồng đội"})).toBeVisible()`.
3. **compose modal closes (Esc)**: with modal open, `page.keyboard.press("Escape")` → `expect(dialog).toBeHidden()` (or `not.toBeVisible()`).

## Success criteria

3 cases green using only role/text selectors. No assertion on kudos card content / counts / seeded rows. Modal open+close verified against real DOM.

## Risks

- If backend empty, sections show empty-state strings — fine, tests don't touch them.
- Send button name is a long localized string; keep it exact-match from messages/vi.json. If brittle, fall back to `getByRole("button").filter({ hasText: "cảm ơn" })`.
- Modal mounts only when `isOpen` (returns null otherwise) → `toBeHidden` after Esc is correct (element detaches).
