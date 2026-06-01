# Improvement Aspect: Platform Parity — agentic-coding-hands-on (saa-2025)
**Use context:** internal

<!-- use-context=internal: mobile app, consumer desktop, and public-SDK entries DROPPED per aspect-14 overrides. -->

---

- Status: opportunity
- Category: platform-parity
- Observation: E2E test suite targets Desktop Chrome only; no Firefox, WebKit/Safari, or mobile-viewport coverage. Employees likely access the awards site on Safari (macOS/iOS) and Firefox, but any rendering or interaction regression in those browsers goes undetected.
- Evidence: `playwright.config.ts:16` — `projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]`; `08-platform-support.md:21` — "Browser test target: Chromium only (Desktop Chrome device profile)"
- Potential improvement: Add Firefox (`devices["Desktop Firefox"]`) and WebKit (`devices["Desktop Safari"]`) project entries to `playwright.config.ts`. Add at least one mobile-viewport project (`devices["Pixel 5"]` or `devices["iPhone 12"]`) to catch layout regressions under Tailwind responsive breakpoints. No new test code needed — existing 14 e2e tests run across all projects automatically.
- Customer-value signal: risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Safari/Firefox bugs (CSS rendering, cookie handling, form submission) ship to production silently; employees on non-Chrome browsers encounter broken UI with no early warning.

---

- Status: opportunity
- Category: platform-parity
- Observation: No mobile-viewport QA exists despite Tailwind CSS v4 responsive utilities being present. The responsive breakpoint behavior is untested at any documented mobile width, meaning layout regressions on small screens reach employees without detection.
- Evidence: `08-platform-support.md:19` — "Responsive / CSS: Tailwind CSS v4"; `08-platform-support.md:21` — browser test target is `Desktop Chrome` only (no mobile viewport project); `playwright.config.ts:16` — single project, no viewport override to a mobile size.
- Potential improvement: Introduce a named `mobile` Playwright project using `devices["Pixel 5"]` or `devices["iPhone 12"]` in `playwright.config.ts`. Scope it to smoke tests (home, kudos board, login) — no new spec files needed. Optionally add a Vitest snapshot test per breakpoint for critical layout components.
- Customer-value signal: employee productivity | risk reduction
- Value: medium
- Effort hint: low
- Risk if untouched: Mobile-browser employees (a realistic subset of an internal audience accessing the site on phones during the awards event) hit undetected layout breakage; no mechanism exists to catch it before the live awards ceremony.

---

- Status: opportunity
- Category: platform-parity
- Observation: No PWA manifest or service worker is present. For an internal event site accessed on mobile browsers (no native app, by design for an internal tool), a PWA manifest would enable add-to-homescreen and basic offline resilience without requiring a full native app.
- Evidence: `08-platform-support.md:23` — "PWA manifest: (none detected) — no manifest.json, manifest.webmanifest, or sw.js in public/"; mobile client delivery: `(none detected)` (`08-platform-support.md:5`)
- Potential improvement: Add a `public/manifest.webmanifest` with app name, icons, `display: standalone`, and `theme_color`. Wire it via a `<link rel="manifest">` in `app/[locale]/layout.tsx`. This is proportionate for an internal web-only site — no service worker or offline caching required unless explicitly desired.
- Customer-value signal: employee productivity
- Value: low
- Effort hint: low
- Risk if untouched: Employees who bookmark or "add to home screen" the awards site on mobile get a generic browser tab experience; minor polish gap for a high-visibility internal event.

---

- Status: clean — no current gap
- Category: platform-parity
- Observation: i18n locale parity (vi + en) is complete — both message files have identical key counts (122 keys each) with zero missing keys in either direction.
- Evidence: `08-platform-support.md:20` — "i18n locales: vi (default) + en"; `messages/en.json` and `messages/vi.json` both contain 122 leaf keys; diff: 0 keys missing from either locale (verified programmatically).
- Potential improvement: No action needed — locale parity is maintained.
- Customer-value signal: employee productivity
- Value: low
- Effort hint: low
- Risk if untouched: No current risk; gap would only open if future feature additions add keys to one locale file without updating the other.
