# Code Review: Unit Test Suite

**Scope:** 5 new test files + vitest.config.ts alias addition
**LOC reviewed:** ~500 lines of tests + 5 source files under test
**Build state:** 137/137 pass, `tsc --noEmit` clean (per orchestrator)

---

## Score: 8.5 / 10

Overall quality is high. Mocks are well-structured and mostly faithful to the real Supabase chain shapes. The `makeChain` builder in `actions.test.ts` is the standout — it correctly handles fluent chains AND thenability, covering both `await builder.method()` and `await builder.method1().method2()` patterns. No critical defects found.

---

## CRITICAL Defects

None.

---

## CONCERNS (should-fix)

### C1 — `routing.test.ts` tests 2–4 are fully redundant

Tests: `"locales has length 2"`, `"locales contains 'vi'"`, `"locales contains 'en'"` (lines 11–20).

Test 1 (`expect(routing.locales).toEqual(["vi", "en"])`) already asserts exact array shape — every property these three tests check is a strict logical consequence of test 1. They cannot fail unless test 1 also fails. If `routing.locales` changes to `["vi", "en", "fr"]`, test 1 catches it while tests 2–4 still pass (length 3 ≠ 2 would fail test 2, but tests 3–4 would still pass — showing they're not a substitute for the equality check either).

**Fix:** Remove tests 2–4. Keep tests 1, 5, 6.

---

### C2 — `request.test.ts` line 64 duplicates line 54

`"cross-check: vi messages equal imported vi.json default"` (line 64–72) is byte-for-byte equivalent to `"returns vi messages"` (line 54–60): same input (`"vi"`), same assertion (compare to `import("@/messages/vi.json").default`). It adds no distinct branch or edge case coverage.

**Fix:** Remove the cross-check test. The existing `"returns vi messages"` test is the authoritative one.

---

## REFINEMENTS (nice-to-have)

### R1 — `actions.test.ts` missing upper-bound hashtag validation

`assertValidCreateKudosInput` throws `"Select between 1 and 5 hashtags"` for both `length < 1` AND `length > MAX_HASHTAGS (5)`. Only the lower bound (empty array) is tested. The upper bound (6 slugs) is not tested in `actions.test.ts`.

Note: `compose-validation.test.ts` does cover this path for the shared `assertValidCreateKudosInput` function directly. Whether `actions.test.ts` also needs it is a judgment call — but the action's validation is exercised through `assertValidCreateKudosInput`, so the existing coverage in `compose-validation.test.ts` is sufficient if you consider it shared. No must-fix.

---

### R2 — `actions.test.ts` missing image count upper-bound test

Same gap: `"Maximum 5 images allowed"` is never triggered in action tests. Again covered by `compose-validation.test.ts` for the shared guard.

---

### R3 — `queries.test.ts` has no `is_anonymous: true` case for `fetchKudosBoard`

All test rows use `is_anonymous: false, anonymous_name: null`. The board mapping logic (`isAnonymous: k.is_anonymous ?? false`, `anonymousName: k.anonymous_name ?? null`) works correctly for this case but the `is_anonymous: true` + non-null `anonymous_name` path is never exercised at the query level. Low risk since the mapping is a one-liner, but a single extra test row in the happy-path fixture would eliminate the gap.

---

## vitest.config.ts Change — Assessment: Sound and Minimal

```ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "."),
  },
},
```

- tsconfig `"@/*": ["./*"]` maps to project root; vitest alias `"@"` → project root is the standard Vite equivalent. The trailing `/*` in tsconfig paths is the glob syntax; Vite's alias resolves prefix matches, so `@/messages/en.json` resolves correctly to `./messages/en.json`.
- The change is additive — it cannot break existing tests that don't use `@/` imports.
- The `include` pattern (`{lib,components,app}/**/*.{test,spec}.{ts,tsx}`) correctly scopes Vitest away from `.claude/` harness tests.
- No concern.

---

## Mock Fidelity Assessment

| Mock | Real chain shape | Mock shape | Verdict |
|------|-----------------|------------|---------|
| `boardClient` | `.from(t).select(cols)` → `{data,error}` | `.from(t) → {select: () => Promise<{data,error}>}` | Correct |
| `statsClient` kudos | `.select(cols,opts).eq(col,val)` → `{count,error}` | `select() → {eq: () → Promise<{count,error}>}` | Correct (opts ignored — acceptable) |
| `statsClient` kudos_likes | `.select(cols).eq(col,val)` → `{data,error}` | same pattern | Correct |
| `makeChain` (actions) | `.insert(row).select(cols).single()` → `{data,error}` | fluent chain + `single()` resolves result | Correct |
| `makeChain` delete | `.delete().eq(a,b).eq(c,d)` → thenabled `{data,error}` | multi-eq supported via `mockReturnThis` | Correct |
| `makeChain` maybeSingle | `.select(cols).eq(a,b).maybeSingle()` | `maybeSingle: vi.fn().mockResolvedValue(result)` | Correct |

The `statsClient` `kudosCallIndex` counter correctly handles `Promise.all` ordering because all three `from()` calls are synchronous (they return builders, not promises), so execution order is deterministic even under `Promise.all`.

---

## Positive Observations

- `vi.hoisted` usage in `queries.test.ts` is correct and properly avoids the hoist-ordering footgun.
- `makeChain` builder in `actions.test.ts` is the right design: both thenable (for bare `await builder.op()`) and chainable (for `.method().method()`). The double-initialization pattern (initial `mockReturnThis` + explicit override at lines 51–55) is intentional and correct.
- `beforeEach` clears/resets mocks consistently; no cross-test pollution risk.
- The `getEventISO` empty-string test correctly documents `??` semantics (pass-through for empty string vs. `||` fallback) — this is a genuine behavioral distinction worth testing.
- Env var save/restore in `event.test.ts` is properly scoped with `beforeEach`/`afterEach`.
- The compensating-delete test in `actions.test.ts` (line 344) correctly verifies both that `delete()` was called AND that `eq("id", CREATED_ID)` was called with the right ID — this is the most security-relevant assertion in the suite.

---

**Status: DONE**

**Summary:** 71 tests across 5 files are well-structured with no critical defects. Two redundant tests inflate the count without adding coverage (C1, C2). Three minor gaps in boundary/variant coverage (R1–R3) are already partially covered by the companion `compose-validation.test.ts`. The `vitest.config.ts` alias addition is correct and minimal.
