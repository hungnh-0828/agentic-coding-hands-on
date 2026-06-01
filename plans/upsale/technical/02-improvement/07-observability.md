# Improvement Aspect: Observability — agentic-coding-hands-on
**Use context:** internal

---

- Status: opportunity
- Category: observability
- Observation: Zero structured logging exists in application code. No logging library (pino, winston, etc.) is imported anywhere in `lib/` or `app/`; the only log infrastructure is CloudWatch log groups provisioned by Terraform for ECS and Lambda, unconnected to app code.
- Evidence: `04-delivery-operations.md:15` — "Logging library: (none) — no pino, winston, structlog, or equivalent imported in lib/ or app/; no console.* calls detected in lib/. CloudWatch log groups provisioned in Terraform for ECS (infra/modules/ecs/main.tf:42-44) and Lambda (infra/modules/lambda/main.tf:8-10) with configurable retention_in_days"
- Potential improvement: Add pino (zero-dep, JSON-native) as a singleton logger in `lib/logger.ts`; instrument server actions (`lib/kudos/actions.ts`) and query layer (`lib/kudos/queries.ts`) with structured log lines at request start, DB call result, and error boundary. Output JSON so CloudWatch Logs Insights can filter/query without custom parsing.
- Customer-value signal: operational efficiency | risk reduction
- Value: high
- Effort hint: low
- Risk if untouched: Silent failures — when `createKudos` or `toggleKudosLike` throw a DB/auth error in production, there is no record of what happened, which user triggered it, or how often it occurs. Debugging production issues requires code redeployment to add logging retroactively, extending mean-time-to-resolve.

---

- Status: opportunity
- Category: observability
- Observation: No error reporting service is wired. Runtime exceptions in Next.js server actions and RSC renders are swallowed silently; there is no aggregated error view, alerting, or stack-trace capture.
- Evidence: `04-delivery-operations.md:18` — "Error reporting: (none) — no Sentry, Bugsnag, or Rollbar found in package.json or source imports"
- Potential improvement: Integrate `@sentry/nextjs` (App Router SDK supports both RSC and server actions). Configure a `sentry.server.config.ts` and `sentry.client.config.ts`; wrap server actions with Sentry's `withServerActionInstrumentation`. Sentry free tier covers the traffic volume of an internal employee awards platform.
- Customer-value signal: operational efficiency | reliability
- Value: high
- Effort hint: low
- Risk if untouched: Employee-reported bugs cannot be correlated with server-side stack traces. The mock auth `SENDER_ID` hardcode (`lib/kudos/actions.ts:23`) and multi-Supabase-query fan-out (`lib/kudos/queries.ts:34`) are both silent failure points that, without error capture, produce invisible data inconsistency or blank UI states during the SAA event window.

---

- Status: opportunity
- Category: observability
- Observation: No metrics endpoint or telemetry pipeline exists. The `/metrics` route is absent and no Prometheus, StatsD, or OpenTelemetry SDK is imported. CloudWatch infrastructure exists but receives no application-level signals.
- Evidence: `04-delivery-operations.md:16` — "Metrics endpoint: (none) — no /metrics route, no Prometheus scrape config"; `04-delivery-operations.md:17` — "Tracing SDK: (none) — no OTel, Datadog, or New Relic imports found"
- Potential improvement: Add `@opentelemetry/sdk-node` with the AWS OTLP exporter (or `@vercel/otel` if Vercel remains the primary deploy target per `08-platform-support.md:12`). Instrument the 6-query parallel fetch in `lib/kudos/queries.ts:34` with spans to surface slow Supabase round-trips. Next.js 15+ has built-in OTel instrumentation via `instrumentation.ts`.
- Customer-value signal: operational efficiency | platform capability
- Value: medium
- Effort hint: medium
- Risk if untouched: No visibility into query latency during peak kudos-submission load (SAA event day). The 6 parallel Supabase queries (`lib/kudos/queries.ts:34`) have no SLO baseline; a regression will be noticed by users, not dashboards.

---

- Status: opportunity
- Category: observability
- Observation: No alerting rules or SLO definitions exist. CloudWatch log retention is configured in Terraform but no alarms, SNS topics, or on-call routing are wired for the ECS or Lambda targets.
- Evidence: `04-delivery-operations.md:15` — CloudWatch log groups exist in `infra/modules/ecs/main.tf:42-44` and `infra/modules/lambda/main.tf:8-10` with `retention_in_days` only — no alarm resources referenced; `04-delivery-operations.md:4` — "Deployment is manual" confirms no automated pipeline or gate to enforce observability thresholds.
- Potential improvement: Add `aws_cloudwatch_metric_alarm` Terraform resources in `infra/modules/ecs/` and `infra/modules/lambda/` for: ECS task restart count, Lambda error rate > 1%, and (if OTel added) p99 latency breach. Wire to an SNS topic with email/Slack subscription. Low-effort addition to existing IaC modules.
- Customer-value signal: risk reduction | reliability
- Value: medium
- Effort hint: low
- Risk if untouched: ECS task crashes or Lambda failures during the SAA event will not page anyone. The two-deployment-target divergence (Vercel + Terraform AWS ECS — `03-architecture-shape.md:56`) means the active production path may be Vercel, where Vercel's built-in analytics are also unconfigured.
