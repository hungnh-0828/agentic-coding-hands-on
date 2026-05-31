# Comprehensive Unit Tests: Alias Hell & Hoisting Traps

**Date**: 2026-06-01 02:30
**Severity**: Medium
**Component**: Testing infrastructure (lib/ scope)
**Status**: Resolved

## What Happened

Delivered 5 test files, 134 passing tests, zero TypeScript errors. Coverage includes event utilities, i18n routing, request locale resolution, Kudos queries, and Kudos actions (like/create mutations). Scope locked to pure logic + mocked Supabase/Next.js APIs — no React hooks or components to avoid new dependencies.

All tests run clean: `npm run test:unit` passes, `tsc --noEmit` passes.

## The Brutal Truth

The planner assumed `@/` path aliases work transparently in Vitest. They don't. The first test run failed immediately with module resolution errors because Vite 5 ignores tsconfig paths — it only honors vite.config.ts. This is documented nowhere obvious, and the error message is unhelpfully generic.

Then the `vi.mock` factories revealed a deeper pain: mocked module definitions are hoisted, but `const` declarations they reference aren't. ReferenceError on every action test. The Vitest docs example never shows typing the mock return correctly, so type errors cascaded through the test file for 15+ minutes of flailing.

This is the stuff that burns hours: assumption-driven failures that look trivial in retrospect but require empirical discovery to fix.

## Technical Details

**Alias resolution failure:**
```
Error: Cannot find module '@/lib/supabase/server' resolved from '/home/.../lib/kudos/__tests__/queries.test.ts'
```
Root cause: Vite 5 loads `resolve.alias` from vite.config.ts, not tsconfig.json.

**Hoisting trap:**
```javascript
// ❌ This fails with ReferenceError: createClient is not defined
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}))
const mockSupabaseClient = { ... } // Too late
```

**Solution for hoisting** — use `vi.hoisted()`:
```javascript
const { mockSupabaseClient, createClient } = vi.hoisted(() => ({
  mockSupabaseClient: { ... },
  createClient: vi.fn(() => mockSupabaseClient)
}))
vi.mock('@/lib/supabase/server', () => ({ createClient }))
```

Type errors in actions.test.ts (24 total) came from trying to mock return types without casting. Fixed by:
```typescript
const mockToggle = vi.mocked(toggleKudosLike) as Mock<...>
mockToggle.mockResolvedValue({ data: null })
```

**Test file stats:**
- event.test.ts: 5 tests (env fallback coverage)
- routing.test.ts: 3 tests (config structure)
- request.test.ts: 13 tests (locale detection + real JSON message loading)
- queries.test.ts: 23 tests (Supabase mocks, sort order, null handling, error fallbacks)
- actions.test.ts: 24 tests (mutation side effects, revalidatePath counts, like constraints)

All edge cases covered: orphan kudos drops, anonymous user mapping, null badge wiring, self-like rejection, compensating deletes on error.

## What We Tried

1. Assumed path aliases work in Vite/Vitest — they don't. Spent 10 minutes debugging.
2. Declared mock factories inline — hoisting error. Tried re-importing inside tests.
3. Typed mock returns generically (`any`) — cascaded type errors downstream. Switched to explicit cast + Mock type.
4. Reviewer flagged redundant assertions (routing array length + contains check, duplicate vi.messages validation) — removed cleanly, no functional impact.

## Root Cause Analysis

The planner followed common Vitest tutorial patterns without verifying empirically that the setup matches this codebase's Vite 5 config. Assumption-driven testing infrastructure planning is a footgun. The hoisting behavior is correct per Vitest spec but underspecified in most examples.

Path aliases in modern bundlers are a perpetual friction point: tsconfig.json, jest.config.js, vitest.config.ts, webpack.config.js all have different ways to declare them. No single source of truth.

## Lessons Learned

1. **Empirically verify module resolution before writing tests.** Run a dummy test importing `@/` and verify the module loads. Don't assume alignment between tsconfig and build tool config.

2. **Understand hoisting semantics of vi.mock vs regular imports.** Hoisted code ↔ inline code has different ordering rules. Use `vi.hoisted()` explicitly when factories reference shared state.

3. **Type mock return values explicitly.** Generic typing leads to cascading errors downstream. Add one extra line of type casting rather than fight inference errors for 30 minutes.

4. **Reviewer catches redundant assertions.** Even with good test coverage, assertion noise makes tests harder to maintain. Remove checks that duplicate previous assertions.

5. **Mocking Supabase in tests requires a clear contract.** Each mocked method must have a stable return shape (hero-badges, newest-first order, null fallbacks). Document these implicitly through test cases.

## Next Steps

1. Commit on test/comprehensive-unit-tests branch (commit 2f1f6cf, pushed).
2. Open PR when ready for merge approval.
3. Update vitest.config.ts with the alias fix in future test runs — this is now the canonical config.
4. Document `@/` alias setup in testing guide (docs/testing-guide.md or similar) so future tests don't re-discover this.

**Status**: DONE. All 134 tests passing, TypeScript clean, reviewer approved with minor cleanup.
