# Playwright E2E Suite

**Date**: 2026-06-01
**Component**: Testing infrastructure (e2e/ scope)
**Status**: Done

## What Was Added

14 tests across three spec files covering the main user journeys:

| File | Coverage |
|---|---|
| `e2e/navigation.spec.ts` | Public route availability, redirect behaviour |
| `e2e/auth.spec.ts` | Login flow, auth guard, post-login redirect |
| `e2e/kudos.spec.ts` | Kudos board load, compose modal, like toggle |

Supporting files: `e2e/helpers/auth.ts` (shared login helper),
`e2e/global-setup.ts` (route warm-up), `playwright.config.ts`.

## Running E2E Tests

One-time browser install (first checkout only):

```bash
npx playwright install chromium
```

Run the suite:

```bash
npm run test:e2e
```

The config starts `next dev` automatically (`webServer` in `playwright.config.ts`)
and warms all routes before the first test runs (`globalSetup`). `retries: 1`
absorbs single-test flake without masking real failures.

## Design Decisions

- **Chromium only** — consistent CI environment; Firefox/WebKit can be added later.
- **Route warm-up in globalSetup** — Next.js dev server lazy-compiles routes on
  first hit; warming them prevents timeout failures on slow CI machines.
- **`retries: 1`** — one retry tolerates transient dev-server variance without
  hiding genuinely broken tests (more than one retry would).
- **No app source changed** — suite tests the running app, not mocked internals.
