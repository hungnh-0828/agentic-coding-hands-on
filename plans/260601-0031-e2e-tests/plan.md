---
title: "Core smoke E2E tests with Playwright"
description: "Add @playwright/test with focused smoke specs for nav/i18n, auth, and kudos board"
status: completed
priority: P2
effort: 4h
branch: test/comprehensive-unit-tests
tags: [testing, e2e, playwright, nextjs]
created: 2026-06-01
completed: 2026-06-01
---

# Core Smoke E2E Tests (Playwright)

DECENT, focused smoke suite for a Next.js 16 app. Role/text/aria selectors ONLY — no source changes, no data-testid. No reliance on seeded DB data (pages tolerate dead backend). Mock auth is client-side, in-memory (lost on reload) — tests honor that.

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Setup: deps, config, script, helpers | completed | [phase-01-setup.md](phase-01-setup.md) |
| 2 | Navigation + i18n specs | completed | [phase-02-nav-i18n.md](phase-02-nav-i18n.md) |
| 3 | Auth specs (login + guard) | completed | [phase-03-auth.md](phase-03-auth.md) |
| 4 | Kudos board + compose modal spec | completed | [phase-04-kudos.md](phase-04-kudos.md) |

## Dependency graph

- Phase 1 blocks 2, 3, 4 (config + signIn helper must exist first).
- Phases 2, 3, 4 are independent of each other (distinct spec files, parallel-runnable).

## Verified codebase facts (drive every selector)

- Next 16.2.6: middleware renamed to `proxy.ts` (root `/`→`/vi` redirect lives there). webServer must serve through it (normal `next dev`/`next start` does).
- i18n: localePrefix "always", default "vi", locales [vi,en]. All paths `/vi/...` `/en/...`.
- Auth: `MockAuthProvider` in-memory; `signIn("regular")` flips state. Reload = unauthenticated.
- `<AuthGuard>` wraps `/sun-kudos` + `/awards-information`; unauth → `router.replace("/login")` → `/{locale}/login`.
- Login button: single `<button>`, label `login.googleCta` = "LOGIN With Google" (SAME string vi+en). After click: 800ms timeout → `signIn` → `LoginForm` effect `router.replace("/")`.
- Locale-stable accessible names (identical vi+en): logo link aria `Sun* Annual Awards — Home`; nav `About SAA 2025`, `Sun* Kudos`; login CTA `LOGIN With Google`; hero image alt `ROOT FURTHER`; kudos compose dialog aria differs per locale.

## webServer strategy (decision)

Use `next dev` with `reuseExistingServer: !process.env.CI`, `url: http://localhost:3000`, `timeout: 120000`. Rationale: fastest local loop, reuses a running dev server. CI does a clean boot. baseURL `http://localhost:3000`. (Alt `next build && next start` noted in phase 1 if dev flakes.)

## Global success criteria

- `npm run test:e2e` boots app, runs all specs headless on Chromium, all green.
- Every assertion hits real DOM/URL (no trivial truthy asserts). Zero `data-testid`. Zero source edits.

## Risks (see phases for mitigations)

- webServer cold-boot > timeout → raise timeout, document build+start fallback.
- 800ms mock delay → await via `expect(page).toHaveURL` with generous timeout, not fixed sleeps.
- Mock-auth reload semantics → guard test relies on it (feature, not bug); login test must stay same-tab (no reload).
