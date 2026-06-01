# Improvement Aspect: Scalability — agentic-coding-hands-on
**Use context:** internal

- Status: opportunity
- Category: scalability
- Observation: `fetchKudosBoard` issues 6 parallel unbounded `SELECT *`-style queries against Supabase on every page render with no pagination, cursor, or row limit. All rows from `kudos`, `kudos_likes`, `kudos_hashtags`, `users`, `departments`, and `hashtags` are fetched into server memory before any filtering or sorting occurs.
- Evidence: `lib/kudos/queries.ts:34-41` — `Promise.all([users, departments, hashtags, kudos, kudos_hashtags, kudos_likes])`, none with `.range()`, `.limit()`, or `count: "exact", head: true`; sort happens in JS at line 119, not in SQL.
- Potential improvement: Add a server-side `ORDER BY created_at DESC LIMIT N` on the `kudos` query (e.g. 50 per page) and derive join data only for the returned IDs. For an internal org this means full dataset stays manageable, but the pattern prevents a runaway query if kudos volume grows across event editions. Use Supabase `.range(from, to)` or `.limit(n)` chained on the kudos query and pass `kudos_id IN (...)` filters to hashtag/like fetches. Existing `kudos_created_at_idx` at `0004_kudos_schema.sql:28` makes the ORDER BY free.
- Customer-value signal: operational efficiency | reliability
- Value: medium
- Effort hint: low
- Risk if untouched: As kudos accumulate across event editions or if the event is reused for future years, the board page payload and query time grow unboundedly; a full-table scan on `kudos_likes` (no covering index on `kudos_id` alone) becomes the slowest leg. At internal org scale this is a latency risk, not a meltdown — but it will manifest as a sluggish board page before any architectural limit is hit.

---

- Status: opportunity
- Category: scalability
- Observation: RLS policies on all kudos-related tables use `using (true)` (grant read-all to anon + authenticated) with no row-scoping predicate. At current internal scale this is fine, but every `SELECT` must still pass through the RLS evaluator, adding per-row overhead with no row reduction.
- Evidence: `supabase/migrations/0002_rls_policies.sql:8-21` — `using (true)` on `users`, `awards`, `notifications`; `supabase/migrations/0004_kudos_schema.sql:55-60` — identical `using (true)` pattern on all kudos tables.
- Potential improvement: For read-all internal tables (departments, hashtags, awards) consider granting SELECT directly to the service role and disabling RLS on those reference tables, eliminating the RLS pass-through cost. For `kudos` and `kudos_likes`, retain RLS but tighten policies when real auth is wired (see auth hardening work). This is a right-sizing action — not hyperscale, but eliminates unnecessary overhead for a bounded employee dataset.
- Customer-value signal: operational efficiency | platform capability
- Value: low
- Effort hint: low
- Risk if untouched: Negligible at current scale; becomes a measurable overhead if table row counts grow (multi-year reuse) and policy complexity increases.

---

- Status: opportunity
- Category: scalability
- Observation: ECS Fargate service is configured with a static `desired_count` (3 in prod, 2 in staging) with no autoscaling policy. The Terraform ECS module provisions FARGATE + FARGATE_SPOT capacity providers but adds no `aws_appautoscaling_target` or `aws_appautoscaling_policy` resource.
- Evidence: `infra/envs/prod/terraform.tfvars:24` — `ecs_desired_count = 3`; `infra/modules/ecs/main.tf:62-71` — capacity providers declared but no autoscaling target or policy resource found in module (grep of infra/ returned no `autoscal` matches).
- Potential improvement: Add a CPU/memory target-tracking autoscaling policy to the ECS service (min=1, max=5 for internal load). For a bounded employee audience the steady-state cost saving from scaling down to 1 task outside business hours is the primary benefit; burst handling (event announcement / kudos rush) is the reliability benefit. Two Terraform resources suffice: `aws_appautoscaling_target` + `aws_appautoscaling_policy` (target-tracking, `ECSServiceAverageCPUUtilization`, target 60%).
- Customer-value signal: operational efficiency | reliability
- Value: medium
- Effort hint: low
- Risk if untouched: Prod runs 3 tasks 24/7 regardless of load, paying idle compute cost; conversely, if a kudos nomination surge hits during the awards announcement window, no scale-out occurs and the fixed 3 tasks absorb all concurrency with no headroom.

---

- Status: opportunity
- Category: scalability
- Observation: No DB connection pool layer exists between ECS tasks and Aurora PostgreSQL. Each Next.js server action and query function calls `createClient()` which opens a new Supabase/PostgREST connection. With 3 Fargate tasks each handling concurrent requests, connection exhaustion is possible if request concurrency spikes.
- Evidence: `lib/supabase/server.ts` — `createServerClient` called per-request; `02-tech-stack.md:49` — "No Redis/ElastiCache, SQS, or search service detected"; `infra/modules/aurora/main.tf:44-45` — Aurora cluster with no RDS Proxy module detected (grep of infra/ returned no `rds_proxy` matches).
- Potential improvement: For an internal app at this scale, the simplest fix is capping Supabase connection pool settings in `supabase/config.toml` (pool_mode = transaction, pool_size tuned to Aurora's `max_connections`). RDS Proxy is the AWS-native option but is overengineered for a bounded internal audience — Supabase's built-in PgBouncer (enabled via `db.pool_mode` in config) is the proportionate choice.
- Customer-value signal: reliability | platform capability
- Value: medium
- Effort hint: low
- Risk if untouched: Under a burst load (all employees checking the board simultaneously at awards announcement), Aurora's default `max_connections` (~100 for a small instance class) can be exhausted, causing `Connection refused` errors with no graceful degradation.

---

- Status: opportunity
- Category: scalability
- Observation: `revalidatePath` in `lib/kudos/actions.ts` manually invalidates two locale-specific paths (`/vi/sun-kudos`, `/en/sun-kudos`) after each mutation. This is a static string list that must be manually updated if locales are added and does not scale to multi-locale deployments without code changes.
- Evidence: `lib/kudos/actions.ts:26-27` — `revalidatePath("/vi/sun-kudos")` + `revalidatePath("/en/sun-kudos")` hardcoded; `lib/i18n/routing.ts:4-5` — locales array is the authoritative source but is not consumed by the revalidation logic.
- Potential improvement: Loop over the `locales` array from `lib/i18n/routing.ts` to build revalidation paths dynamically. Two-line change, eliminates a stale-cache risk if a third locale is added.
- Customer-value signal: operational efficiency | time-to-market for dependent teams
- Value: low
- Effort hint: low
- Risk if untouched: Adding a new locale leaves the new path un-revalidated after kudos mutations; board shows stale data for that locale until the cache naturally expires.
