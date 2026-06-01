# Security Audit Report

**Scope:** Application security surfaces — auth, server actions, data layer, Supabase RLS/migrations, middleware, and AWS Terraform infra.
**Method:** STRIDE + OWASP Top 10, secret scan, `npm audit`. Audit-only (no `--fix`).
**Date:** 2026-06-01

## Summary
- Files reviewed: server actions, queries, supabase client, RLS migrations (0002/0004/0005), `proxy.ts`, auth (`lib/auth/*`), compose/image-uploader/like/copy components, all `infra/modules/*`.
- Findings: 0 critical, 2 high, 2 medium, 3 low, 2 info.
- Context: app is explicitly a **demo** (mock client-side auth, documented `TODO(auth)` markers). Severities reflect production-readiness, not demo intent.

## Findings

| # | Severity | Category (STRIDE / OWASP) | File:Line | Description | Fix Recommendation |
|---|----------|---------------------------|-----------|-------------|--------------------|
| 1 | High | Elevation / A01 Broken Access Control | supabase/migrations/0004_kudos_schema.sql:60; 0005_compose_kudos.sql:14-28 | Write RLS on `kudos`, `kudos_hashtags`, `kudos_likes` is fully permissive (`for all to anon,authenticated using(true) with check(true)`). The Supabase **anon key is `NEXT_PUBLIC_`** (lib/supabase/server.ts:11), shipped to the browser. Any visitor can call the Supabase REST API directly to insert/update/delete arbitrary kudos, forge `sender_id`, and add/remove likes for any `user_id` — bypassing every server-action validation. | Replace `using(true)/with check(true)` writes with `auth.uid() = sender_id` (kudos) and `auth.uid() = user_id` (likes) once real Supabase Auth lands. Until then, route all writes through a server-only client using the service-role key and keep table writes closed to `anon`. |
| 2 | High | Spoofing / A01 | lib/kudos/actions.ts:33, 23 | `toggleKudosLike(kudosId, userId)` derives the acting user from a client-supplied argument; `createKudos` hard-codes `SENDER_ID`. Identity is never session-derived, so any caller can act as any user. | Derive user id from the authenticated session (`supabase.auth.getUser()`) server-side; drop the `userId` param and the `SENDER_ID` constant. |
| 3 | Medium | Tampering / DoS — A03/A05 | lib/kudos/compose-validation.ts:35-45; lib/kudos/actions.ts:96-104 | Server validation enforces only hashtag count (1–5) and image **count** (≤5). It does NOT bound `title`/`content`/`anonymousName` length, validate that `imageUrls` are real images, or enforce `MAX_IMAGE_BYTES` — that byte cap exists **only client-side** (image-uploader.tsx:26). Images are stored inline as data URLs, so a direct caller can persist multi-MB blobs and unbounded text rows (storage bloat / payload DoS). | Add server-side guards in `assertValidCreateKudosInput`: max length on title/content/anonymousName, per-URL byte/length cap, and a `data:image/(png|jpeg);base64,` format check on each `imageUrl`. |
| 4 | Medium | Elevation / A01 | app/[locale]/admin-dashboard/page.tsx:6 | The `/admin-dashboard` route has **no** auth or role gate — neither `AuthGuard` nor a server-side role check. Currently a "coming soon" placeholder, but the route is reachable by anyone and invites privileged content with no guard. | Wrap in a server-side session+role check before adding any real content; do not rely on the client `AuthGuard`. |
| 5 | Low | A07 Auth Failures | lib/auth/auth-guard.tsx:11-28; lib/auth/mock-auth-context.tsx | Auth is a client-only mock; the guard redirects in `useEffect`, and server components / data fetching ignore it entirely. No real session enforcement exists. Documented as demo. | Replace with middleware/server-side session checks when wiring real auth; gate data fetches, not just rendering. |
| 6 | Low | Information Disclosure / A09 | lib/kudos/actions.ts:59, 68, 88, 111, 121 | `throw new Error(error.message)` propagates raw Supabase/Postgres error text to the client, leaking schema/constraint detail. | Log the detailed error server-side; return a generic message to the caller. |
| 7 | Low | A06 Vulnerable Components | package.json / npm audit | `npm audit` reports 2 moderate: `postcss <8.5.10` (XSS in CSS stringify, GHSA-qx2v-qp2m-jg93) pulled in via `next`. Build-time tool, low runtime exposure. | Track Next.js minor that bumps the transitive `postcss`; avoid `audit fix --force` (it down-pins `next` to 9.x). |
| 8 | Info | A05 / Defense-in-depth | infra/modules/security-groups/variables.tf:25; infra/modules/alb/main.tf | Public ALB ingress defaults to `0.0.0.0/0` (expected for a public site) but there is no AWS WAF or rate limiting in front of it. | Attach AWS WAF (managed rule sets + rate-based rule) to the prod ALB. |
| 9 | Info | Repudiation | lib/kudos/actions.ts | No audit trail for kudos create / like-toggle (no actor, timestamp-of-actor, or log). Acceptable for demo. | Add an audit log table or structured server log when writes go through an authenticated path. |

## Positives (no action needed)
- **Infra is well-hardened:** S3 blocks all public access + `BucketOwnerEnforced` + TLS-only bucket policy + SSE; Aurora is `storage_encrypted`, master password generated and stored in Secrets Manager (never hardcoded), private subnets, scoped SGs (RDS reachable only from ECS/Lambda); ALB uses TLS1.3 policy, HTTP→HTTPS redirect when a cert is present, `drop_invalid_header_fields`, and a prod precondition requiring `certificate_arn`.
- **No XSS sinks:** no `dangerouslySetInnerHTML`/`eval`/`innerHTML`; user content (`title`, `content`) rendered through JSX auto-escaping.
- **No hardcoded secrets** in tracked source; `supabase/config.toml` uses `env(...)` references; no `.env` files tracked.
- **RLS enabled** on every table (read policies intentionally permissive per demo convention).

## Unresolved questions
- Is the deployment intended to stay demo-only, or is real Supabase Auth on the near-term roadmap? Findings #1/#2/#5 collapse into one work item once auth lands.
- Are kudos images meant to remain inline data URLs, or move to Supabase Storage? That decision changes the fix for #3.
