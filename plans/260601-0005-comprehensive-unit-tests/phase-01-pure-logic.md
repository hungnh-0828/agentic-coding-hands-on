# Phase 1 — Pure logic: event + i18n routing

Priority: P2 | Status: completed | No mocks needed (pure modules).

## Files to create
- `lib/__tests__/event.test.ts`
- `lib/i18n/__tests__/routing.test.ts`

## Source facts
- `lib/event.ts`: `FALLBACK_EVENT_ISO = "2025-12-31T18:30:00+07:00"`; `getEventISO()` returns `process.env.NEXT_PUBLIC_EVENT_DATETIME ?? FALLBACK_EVENT_ISO`.
- `lib/i18n/routing.ts`: `routing = defineRouting({ locales:["vi","en"], defaultLocale:"vi", localePrefix:"always" })`. `routing` exposes `.locales`, `.defaultLocale`, `.localePrefix`.

## Mock setup
None. For event tests, save/restore `process.env.NEXT_PUBLIC_EVENT_DATETIME` in `beforeEach`/`afterEach` (set/delete; restore original).

## Test cases — event.test.ts
- [x] FALLBACK_EVENT_ISO equals exact string `"2025-12-31T18:30:00+07:00"`.
- [x] FALLBACK is a valid parseable date (`!Number.isNaN(Date.parse(FALLBACK_EVENT_ISO))`).
- [x] getEventISO() returns FALLBACK when env var unset (`delete process.env.NEXT_PUBLIC_EVENT_DATETIME`).
- [x] getEventISO() returns env value when set (e.g. set to `"2026-01-01T00:00:00+07:00"` → returns it).
- [x] getEventISO() returns env value even when empty-string?? No — `??` only catches null/undefined; empty string passes through. Assert empty string env → returns `""` (documents `??` vs `||` behavior — real logic).

## Test cases — routing.test.ts
- [x] `routing.locales` equals `["vi","en"]` (toEqual).
- [x] `routing.locales` has length 2; contains "vi" and "en".
- [x] `routing.defaultLocale` === "vi".
- [x] `routing.localePrefix` === "always".

## Success criteria
Both files green under `npm test`. Env restored after each test (no leakage into other suites).
