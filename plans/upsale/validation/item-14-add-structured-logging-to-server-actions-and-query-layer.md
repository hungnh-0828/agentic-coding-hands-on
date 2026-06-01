---
item_index: 14
item_slug: add-structured-logging-to-server-actions-and-query-layer
track: technical
decision: revise
---

# Audits

- **Clause:** Zero structured logging exists in application code
  - **Evidence:** `grep -r "pino|winston|bunyan|logger"` across `lib/` and `app/` returned 0 hits; `package.json` dependencies list only `@supabase/ssr`, `@supabase/supabase-js`, `next`, `next-intl`, `react`, `react-dom` — no logging library present.
  - **Verdict:** correct

- **Clause:** No logging library (pino, winston, etc.) imported anywhere in `lib/` or `app/`
  - **Evidence:** Same grep as above; confirmed zero imports. `lib/kudos/actions.ts:1-8` imports only `next/cache`, `@/lib/supabase/server`, and local modules. `lib/kudos/queries.ts:1-11` imports only `@/lib/supabase/server` and local types. No `console.*` calls in `lib/` either.
  - **Verdict:** correct

- **Clause:** CloudWatch log groups provisioned in Terraform for ECS and Lambda but unconnected to app code (`04-delivery-operations.md:15`)
  - **Evidence:** `item_evidence` line: `04-delivery-operations.md:15` — "Logging library: (none) — no pino, winston, structlog, or equivalent imported in lib/ or app/; CloudWatch log groups provisioned in Terraform for ECS (infra/modules/ecs/main.tf:42-44) and Lambda (infra/modules/lambda/main.tf:8-10)". Not directly grep-verified from repo in this session, but supported verbatim by `item_evidence`.
  - **Verdict:** correct

- **Clause:** `createKudos` and `toggleKudosLike` throw DB/auth errors silently in production
  - **Evidence:** `lib/kudos/actions.ts:59` — `if (delError) throw new Error(delError.message)`; `lib/kudos/actions.ts:111` — `if (kudosError) throw new Error(kudosError.message)`. Both throw raw JS errors with no logging. `lib/kudos/queries.ts:130-132` — bare `catch { return EMPTY; }` swallows all errors silently. No logger call anywhere in either file.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — all Need claims are verified against the repo; item is coherent and the proposed solution matches the problem. Check 5 (hallucination guard) — `lib/kudos/actions.ts:23` SENDER_ID citation and `lib/kudos/queries.ts:34` 6-query Promise.all citation are both correct. One REVISE: pino uses Node.js-specific APIs (`process.stdout`, `fs`) and is not edge-runtime compatible; the Proposed solution must note this constraint so implementers do not accidentally import `lib/logger.ts` in `proxy.ts` or any edge route. The item's proposed scope (server actions + `queries.ts`) is Node.js RSC only, so pino is valid there — but the constraint needs to be documented. No overlap with item-15 (Sentry error capture); the two are complementary.

# Revised item

## Add structured logging to server actions and query layer

- **Value:** high
- **Need:** Zero structured logging exists in application code; no logging library (pino, winston, etc.) imported anywhere in `lib/` or `app/`; CloudWatch log groups provisioned in Terraform for ECS and Lambda but unconnected to app code (`04-delivery-operations.md:15`); `createKudos` and `toggleKudosLike` throw DB/auth errors with no log record (`lib/kudos/actions.ts`); `fetchKudosBoard` swallows all errors silently via a bare `catch { return EMPTY; }` (`lib/kudos/queries.ts:130`).
- **Benefits:** Silent failures in production during the SAA event become observable without a redeploy; CloudWatch Logs Insights can filter structured JSON without custom parsing; reduces mean-time-to-resolve for DB/auth incidents.
- **Proposed solution:** Add pino (zero-dep, JSON-native, Node.js runtime only — do NOT import in `proxy.ts` or any `export const runtime = "edge"` route) as a singleton logger in `lib/logger.ts`; instrument server actions (`lib/kudos/actions.ts`) and query layer (`lib/kudos/queries.ts`) with structured log lines at request start, DB call result, and error boundary; output JSON so CloudWatch Logs Insights can filter/query without custom parsing.
- **Effort hint:** low
