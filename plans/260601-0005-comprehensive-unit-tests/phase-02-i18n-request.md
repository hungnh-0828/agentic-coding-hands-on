# Phase 2 — i18n request resolution

Priority: P2 | Status: completed | Mock: `next-intl/server` only.

## File to create
- `lib/i18n/__tests__/request.test.ts`

## Source facts (`lib/i18n/request.ts`)
```
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: (await import(`@/messages/${locale}.json`)).default };
});
```
- `requestLocale` is a Promise (callback awaits it).
- `hasLocale` is REAL (do not mock) — accepts (locales, value), narrows to known locale.
- Messages: real files `messages/vi.json`, `messages/en.json` exist; dynamic import via `@/messages/...` alias resolves under vitest (probed).

## Mock setup
The module's default export is the RESULT of `getRequestConfig(cb)`. To test the callback `cb`, mock `next-intl/server` so `getRequestConfig` returns the callback it's given:
```ts
import { vi } from "vitest";
vi.mock("next-intl/server", () => ({
  getRequestConfig: (cb: unknown) => cb,   // identity: expose the callback
}));
import getConfig from "../request"; // = the callback
```
Then call `getConfig({ requestLocale: Promise.resolve(<value>) })` and assert the returned `{ locale, messages }`.
- Do NOT mock `next-intl` (use real `hasLocale`). Do NOT mock the messages import.

## Test cases
- [x] requestLocale "en" (valid) → result.locale === "en"; messages === content of messages/en.json (assert `messages.nav` exists / equals imported en.json `.default`).
- [x] requestLocale "vi" (valid) → result.locale === "vi"; messages from vi.json.
- [x] requestLocale "fr" (invalid) → falls back to "vi" (routing.defaultLocale); messages from vi.json.
- [x] requestLocale undefined → falls back to "vi".
- [x] result always has both keys `locale` and `messages` (messages is non-null object).
- [x] (cross-check) loaded vi messages equal `(await import("@/messages/vi.json")).default` to prove correct file chosen — import the json in the test and compare.

## Risks
- If identity-mock approach fails (getRequestConfig wraps/validates), fallback: assert the default export is callable and invoke it the same way. Confirm at implementation time by reading next-intl/server typings; KISS — identity mock is the simplest that works.

## Success criteria
File green; invalid + undefined both resolve to "vi"; correct messages object returned per locale.
