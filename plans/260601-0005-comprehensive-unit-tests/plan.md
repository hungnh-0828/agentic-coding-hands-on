---
title: "Comprehensive unit tests for 5 lib modules"
description: "Vitest (node env) unit tests for event, i18n routing/request, kudos queries + actions with real Supabase/cache mocks."
status: completed
priority: P2
effort: 3h
branch: main
tags: [testing, vitest, kudos, i18n]
created: 2026-06-01
---

# Comprehensive Unit Tests

Add Vitest unit tests for 5 `lib/` modules. Node env only, no jsdom, no new deps.
Mocking is via `vi.mock` keyed on the EXACT import specifier in each source file.

## Validated Facts (probed, not guessed)
- `@/` alias RESOLVES under vitest (Vite reads tsconfig `paths`). Confirmed by probe test.
- `vi.mock("@/lib/supabase/server", ...)` intercepts BEFORE real module loads → no real Supabase/`next/headers` cookies needed.
- Test convention: co-located `__tests__/`, `import { describe, it, expect, vi } from "vitest"`, globals on.
- Source import specifiers to mock: `@/lib/supabase/server` (createClient), `next/cache` (revalidatePath), `next-intl/server` (getRequestConfig), dynamic `@/messages/${locale}.json`.

## Phases (Phases 1–4 are independent / parallel-runnable; each owns distinct files)

| # | Phase | Status | File(s) owned |
|---|-------|--------|---------------|
| 1 | Pure logic: event + i18n routing | completed | lib/__tests__/event.test.ts, lib/i18n/__tests__/routing.test.ts |
| 2 | i18n request resolution | completed | lib/i18n/__tests__/request.test.ts |
| 3 | kudos queries (Supabase mock) | completed | lib/kudos/__tests__/queries.test.ts |
| 4 | kudos actions (Supabase + cache mock) | completed | lib/kudos/__tests__/actions.test.ts |

No phase blocks another — distinct test files, no shared fixtures edited concurrently.
A shared Supabase mock-builder helper (Phase 3 & 4) is duplicated minimally per-file (KISS) — do NOT extract a shared util unless both authors coordinate; if extracted it lives at `lib/kudos/__tests__/_supabase-mock.ts` and Phase 3 owns it, Phase 4 imports it.

## Dependency / Mock Surface Summary
- Phase 2: mock `next-intl/server` getRequestConfig to capture the callback; do NOT mock `next-intl` (use real `hasLocale`); messages import is real (`messages/vi.json`, `messages/en.json` exist).
- Phase 3: `fetchKudosBoard` issues 6 `.from().select()` calls via Promise.all; `fetchKudosStats` uses `.select(...,{count,head}).eq()` + a join select. Mock returns `{data, error, count}`.
- Phase 4: chained `.from().select().eq().eq().maybeSingle()`, `.insert()`, `.insert().select().single()`, `.delete().eq()`; plus `revalidatePath`.

## Success Criteria
- `npm test` passes, all new tests green, no `.only`, no skipped.
- Real assertions on real logic (transforms, sort, branching, error fallback, thrown messages). No tautologies.
- No new dependencies added. No edits to source files.

## Risks
- R1 (Med): mock specifier mismatch → source uses `@/lib/supabase/server`; mocks MUST use same string. Mitigation: phase files state exact specifier.
- R2 (Low): chained-builder mock drift vs real call order. Mitigation: each phase lists exact chain per call.
- R3 (Low): dynamic message import path in request.ts uses `@/messages/${locale}.json` — confirmed alias resolves; real import is fine.

## Phase Files
- phase-01-pure-logic.md
- phase-02-i18n-request.md
- phase-03-kudos-queries.md
- phase-04-kudos-actions.md
