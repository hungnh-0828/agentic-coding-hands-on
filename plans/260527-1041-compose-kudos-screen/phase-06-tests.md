# Phase 06 — Tests

Track: verification · Status: completed · Blocked by: 05

## Context
No test runner exists yet (package.json scripts: dev/build/start/lint only; npm; React 19 / Next 16). Introduce Vitest (KISS, fast, ESM-native) ONLY for the high-value pure logic: form validation + input assembly. Avoid heavy E2E/browser infra (YAGNI) unless `tester` agent advises otherwise.

## Files
- Create: `vitest.config.ts`, `lib/kudos/__tests__/compose-validation.test.ts` (+ extract pure helpers if needed)
- Modify: `package.json` (devDeps: vitest; script `"test": "vitest run"`)
- Possibly create: `lib/kudos/compose-validation.ts` — extract the disabled/validity + input-normalization logic out of the form so it is unit-testable without React (DRY: server action in phase-02 can import the same guards)

## Implementation steps
1. Add Vitest devDependency + `test` script (npm).
2. Extract pure validation: `isComposeValid(state)` (receiver set, title non-empty, content non-empty, 1–5 hashtags) and `normalizeKudosInput(state): CreateKudosInput`. Both used by form (phase-04) and reusable by action guards.
3. Unit tests:
   - valid full input → `isComposeValid` true; normalize produces expected shape.
   - missing recipient / empty title / empty content / 0 hashtags → invalid.
   - 6 hashtags rejected; 5 allowed.
   - 6 images rejected; 5 allowed; non-jpg/png rejected by the type guard.
   - receiver === sender id → invalid (guards `sender_not_receiver`).
   - anonymous on with empty name vs filled name → assert `anonymousName` mapping.
4. Run `npm test`; all green. If a test fails, fix code per recommendations, re-run.

## Todo
- [ ] Add vitest + `test` script
- [ ] Extract `compose-validation.ts` pure helpers
- [ ] Write `compose-validation.test.ts` covering matrix above
- [ ] `npm test` green
- [ ] `npx tsc --noEmit` + lint clean

## Test matrix
| Case | Expect |
|------|--------|
| all required filled | valid |
| no recipient | invalid |
| empty title | invalid |
| empty content | invalid |
| 0 hashtags | invalid |
| 5 hashtags | valid |
| 6 hashtags | invalid |
| 6 images | rejected |
| non-image file | rejected |
| receiver==sender | invalid |
| anonymous on, name filled | input.anonymousName set |

## Success criteria
- `npm test` passes; validation matrix covered.
- Helpers shared between UI and server guards (no duplicated rules).
- No fake/mocked passes — tests exercise real helper logic.

## Risk assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| Vitest + Next 16/React19 ESM config friction | Med×Med | Test pure helpers only (no Next/React runtime); minimal vitest.config |
| Logic duplicated (UI vs server) drifts | Med×Med | Single `compose-validation.ts` imported by both |
| Scope creep into E2E | Med×Low | YAGNI — defer browser/E2E unless tester recommends |

## Next
Final phase. On green: update `docs/project-changelog.md` + roadmap (doc-writer) if required by workflow.
