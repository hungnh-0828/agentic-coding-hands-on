---
item_index: 15
item_slug: integrate-error-reporting-sentry
track: technical
decision: KEEP
---

# Audits

- **Clause:** No error reporting service wired
  - **Evidence:** `package.json` lists 17 direct dependencies; ripgrep on `sentry|bugsnag|rollbar|@sentry` across all `.ts`/`.tsx`/`.js` source files (excluding `node_modules`) returned 0 hits. `04-delivery-operations.md:18` confirms: "Error reporting: (none) — no Sentry, Bugsnag, or Rollbar found in `package.json` or source imports."
  - **Verdict:** correct
- **Clause:** Runtime exceptions in Next.js server actions and RSC renders are swallowed silently
  - **Evidence:** Zero error-capture imports in `lib/` or `app/` (grep returned no results); no `try/catch` with external capture, no global error boundary wired to any reporting service. Consistent with `04-delivery-operations.md:18`.
  - **Verdict:** correct
- **Clause:** No aggregated error view, alerting, or stack-trace capture (`04-delivery-operations.md:18`)
  - **Evidence:** `04-delivery-operations.md:18` states exactly "Error reporting: (none) — no Sentry, Bugsnag, or Rollbar found in `package.json` or source imports." CloudWatch log groups exist for ECS (`infra/modules/ecs/main.tf:42-44`) and Lambda (`infra/modules/lambda/main.tf:8-10`) but carry only infrastructure-level stdout — no application-level error aggregation or alerting wired.
  - **Verdict:** correct
- **Clause:** The mock auth `SENDER_ID` hardcode (`lib/kudos/actions.ts:23`) is a silent failure point
  - **Evidence:** `lib/kudos/actions.ts:23` contains `const SENDER_ID = "00000000-0000-0000-0000-000000000001";` with a `TODO(auth)` comment. No error is thrown or captured if this placeholder is used in production; the failure is invisible without error reporting.
  - **Verdict:** correct
- **Clause:** The multi-query fan-out (`lib/kudos/queries.ts:34`) is a silent failure point
  - **Evidence:** `lib/kudos/queries.ts:34` (approximately) executes `Promise.all([...6 Supabase queries...])` inside a try/catch that returns an empty result on any DB error — errors are silently swallowed with no external capture.
  - **Verdict:** correct

# Reason

Check 1 (holistic): all Need claims are verified against `04-delivery-operations.md:18`, package.json scan, and repo source. No error tracking exists anywhere in the application. The proposed `@sentry/nextjs` solution is implementable in the detected stack (Next.js 16 App Router, which the SDK explicitly supports for RSC and server actions). Sentry free-tier is sufficient for an internal SAA event tool. AWS-native alternatives (CloudWatch Errors filters + SNS) would require more infrastructure configuration for equivalent stack-trace capture; Sentry is a defensible concrete choice, not over-reach. Overlap with item-14 (structured logging) is not redundant — logging captures operational flow, error reporting captures unhandled exceptions with stack traces; both are distinct observability layers. Checks 2–6 all pass: Value `high` is anchored by a time-bounded production-risk event (SAA event window with silent failure points); use-context `internal` is satisfied (observability is not monetization); Benefits cite concrete operational outcomes; no invented citations; formatting is correct.

