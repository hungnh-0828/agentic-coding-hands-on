---
item_index: 3
item_slug: add-coverage-provider-baseline-thresholds-and-test-coverage-script
track: technical
decision: KEEP
---

# Audits

- **Clause:** No coverage provider installed; `vitest.config.ts` defines no `coverage` block
  - **Evidence:** `vitest.config.ts` — 18 lines, `test:` block contains only `environment`, `globals`, `include`, `exclude` keys; no `coverage:` key at any line. Confirmed by direct file read.
  - **Verdict:** correct

- **Clause:** No `@vitest/coverage-v8` or `@vitest/coverage-istanbul` in `package.json`
  - **Evidence:** `package.json` `devDependencies` (lines 21–33) lists only `vitest@^2.1.9`; no `@vitest/coverage-v8` or `@vitest/coverage-istanbul` present.
  - **Verdict:** correct

- **Clause:** No baseline has ever been generated (`vitest.config.ts` 18 lines, no coverage key)
  - **Evidence:** `vitest.config.ts` confirmed 18 lines with no `coverage` key (direct read). `item_evidence` cites `04-delivery-operations.md` — "Coverage file: (none) — no coverage/ directory, no lcov.info, no c8/istanbul config". No `coverage/` directory found under repo root.
  - **Verdict:** correct

- **Clause:** `package.json:10-11` — `"test": "vitest run"` has no `--coverage` flag
  - **Evidence:** `package.json` line 10: `"test": "vitest run"` — no `--coverage` flag. Line 11: `"test:e2e": "playwright test --project=chromium"`. No `test:coverage` script present.
  - **Verdict:** correct

- **Clause:** No CI invocation exists
  - **Evidence:** `item_evidence` cites `04-delivery-operations.md` — "CI/CD provider + pipeline stages: (none) — no `.github/workflows/`, no Jenkinsfile". No `.github/` directory found in repo tree.
  - **Verdict:** correct

- **Clause:** Team has no data to decide whether threshold enforcement is feasible
  - **Evidence:** Follows directly from the confirmed absence of any coverage provider, coverage block, and coverage script. No coverage artifact exists to derive a baseline from. Claim is a logical consequence of verified facts above.
  - **Verdict:** correct

# Reason

Check 1 (holistic): item is fully coherent and every Need claim is verified against the repo. The gap is real — `vitest.config.ts` has no `coverage` block, `package.json` carries no coverage provider, and no `test:coverage` script exists. Proposed solution (`@vitest/coverage-v8` + config block + script) directly addresses the Need. Value `medium` is defensible (check 2): named KPI is coverage baseline as a prerequisite for any CI gate, concrete reliability signal for `lib/kudos/` and `lib/auth/`. Use-context `internal` is satisfied (check 3): item is operational efficiency, not monetisation. Benefits (check 4) cite concrete outcome — baseline generation and prerequisite for CI threshold enforcement. No secrets or fabricated citations (check 5). Formatting intact (check 6). All checks pass.
