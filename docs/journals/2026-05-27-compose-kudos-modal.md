# Compose Kudo Modal: Parallel Tracks, Stale Specs, and One Sneaky JSON Bug

**Date**: 2026-05-27 14:30  
**Severity**: Medium (scope creep + hidden bugs surfaced mid-build)  
**Component**: Kudos board (compose modal, server action, RLS policies, hashtag validation)  
**Status**: Resolved (PR #6 merged)

## What Happened

Built a compose-kudo modal on the existing sun-kudos board. The feature accepts: recipient autocomplete, danh hiệu (title field), visual-only formatting toolbar, 1–5 hashtag chips, image uploader (≤5 data URLs, 2MB cap), anonymous send with optional display name. Submit button disabled until form validates. Real Supabase insert via new createKudos server action + migration 0005 (kudos table gains title, is_anonymous, anonymous_name, image_urls columns). Parallel implementation across Track A (UI components) and Track B (backend) resolved in a single integration pass. Playwright E2E tests verified: normal submission, anonymous submission, real DB insert, board refresh via router.refresh().

## The Brutal Truth

This felt smooth until two critical gaps surfaced. The Figma design showed a mandatory "Danh hiệu" (title) field that the 26-row specs CSV completely omitted. We almost shipped without it. Then, during testing, the board marketing section rendered the wrong data — turns out the JSON i18n file had TWO top-level `kudos` keys, and JavaScript's last-wins rule silently destroyed the real namespace. Both bugs made it past initial review because nobody cross-referenced the visual spec against the written one, and nobody searched for duplicate keys in i18n.

## Technical Details

**Figma-specs mismatch:**
- Design (Frame 552): title field clearly rendered, required state visible
- Specs CSV row 16: zero mention of title; only recipient, hashtags, image listed
- Migration 0005: added `title` VARCHAR(100) to kudos table post-implementation
- Server action guard (createKudos): validates title non-empty, ≤100 chars

**JSON namespace collision:**
- File: `/messages/en.json` and `/messages/vi.json`
- Bug: Two `"kudos"` top-level keys; last one wins, clobbering the first
- Impact: sun-kudos-section.tsx was reading wrong object structure
- Fix: Renamed first to `"kudosSection"`, repointed component from `t("kudos.board_title")` to `t("kudosSection.board_title")`

**Hashtag validation complexity:**
- Compose form hook → useCallback to convert chips to slugs
- Shared lib/kudos/compose-validation.ts: both client (form validation) and server (createKudos) call the same function
- Discovered: partial slug resolution (e.g., hashtag text but DB lookup fails) → form should reject, not insert partial state
- Fixed: server-side guard now rejects if any hashtag_id lookup fails

**vitest config scope creep:**
- Ran: `vitest run` → picked up .claude/hooks .cjs test files (not Vue/Node tests)
- Globbed: `**/*.test.ts` + `**/*.spec.ts` (too broad)
- Fixed: scoped config to `include: ['app/**/*.test.ts', 'components/**/*.test.ts', 'lib/**/*.test.ts']` + excluded `.claude/**`
- Result: 62 relevant tests, 0 failures

**React 19 state sync edge case:**
- Render-time issue: data.kudos array updates → need to sync to context state
- Old pattern: setState in useEffect (flagged by eslint react/exhaustive-deps)
- Fixed: used "adjust state while rendering" pattern: compare prev-ref, update state directly in render
- No additional renders; works per React 19 RFCs

## What We Tried

1. **Specs-first approach** (failed): Wrote schema from specs CSV alone → missed title field → caught by Figma review
2. **Generic JSON validation** (failed): Assumed `t("kudos")` was working → ignored second key silently
3. **Separate validation logic** (inefficient): Started with form-only validation → realized server needed same rules → refactored to shared lib
4. **vitest without scoping** (slow/noisy): Full repo glob added 200+ unrelated tests → narrowed scope by file path

## Root Cause Analysis

**Why Figma specs diverged from CSV:**
- Figma updated post-CSV export; no re-sync step in the workflow
- Design-as-source-of-truth principle not enforced — specs CSV treated as primary
- No cross-reference checklist (visual + functional specs) before implementation

**Why JSON bug went undetected:**
- i18n files never manually inspected for key collisions
- No `jq` or `JSON.parse` validation in CI/CD
- Component test only checked one namespace path, not all paths

**Why vitest scoped badly:**
- Inherited vite.config.ts glob patterns (no vitest-specific override)
- .claude/hooks excluded from `.gitignore` but not from test runner config
- Assumption that test files only exist in app/components/lib (wrong)

## Lessons Learned

1. **Figma is the visual spec. Treat it as authoritative.** CSV specs are stale by default. Compare every design decision (required field, color, layout) against the design file before closing clarifications. One extra 5-minute review saved a breaking change.

2. **Cross-reference all i18n files at build time.** Add a simple build-time check: parse JSON, collect all top-level keys, fail if duplicates exist. This is a YAGNI fix (one-liner in a script) that prevents silent data loss.

3. **Shared validation library is worth the upfront cost.** Started with form-only validation, discovered server needed the same rules, refactored to `lib/kudos/compose-validation.ts`. DRY paid off immediately — the final server-side hashtag-id guard was a 3-line call, not a re-implemented version.

4. **Always scope test globs in new test runners.** vitest doesn't inherit vite.config.ts glob unless you explicitly tell it to. Spent 20 minutes debugging why unrelated test files ran. Solution: explicit `include` list in vitest.config.ts, not wildcards.

5. **React 19 state sync: read the RFC.** The "adjust state while rendering" pattern is not obvious. Spent 30 minutes trying useEffect approaches before finding the RFC example. It's the right pattern for render-time data syncs.

## Next Steps

1. **Mandatory: Add i18n key-collision check to CI.** Script: read all `messages/*.json`, collect keys, assert no duplicates, fail build if found. Owner: devops. Timeline: before next i18n update.

2. **Add clarification checklist to MoMorph workflow.** Before implementation, check: (a) all design frames present in spec CSV, (b) all spec rows visible in Figma. Prevents design-spec drift. Owner: team lead. Timeline: next sprint.

3. **Document the "adjusted state during render" pattern in code-standards.md.** Include React 19 RFC link. Future devs won't spend 30 minutes guessing. Owner: doc-writer. Timeline: this sprint.

4. **Monitor hashtag insertion failures in prod.** The RLS policy guard now rejects partial inserts, but orphaned kudos records might exist from prior bugs. Log all hashtag_id lookup failures, investigate. Owner: backend lead. Timeline: 2-week audit.

---

**Commit**: 7e4dedc on feat/compose-kudos  
**PR**: #6 (main)  
**Reviewer Score**: 7.5/10 (0 critical, 4 major addressed, 3 minor noted for future)
