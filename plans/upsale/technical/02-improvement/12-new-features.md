# Improvement Aspect: New Features — agentic-coding-hands-on
**Use context:** internal

- Status: opportunity
- Category: new-features
- Observation: The `notifications` table (id, user_id, title, body, read_at, created_at) with an unread index was created in migration 0001 and an unread count is already surfaced in the header bell, but no server action or UI panel exists to write notifications on kudos events or mark them read.
- Evidence: `supabase/migrations/0001_initial_schema.sql:24-34` (table + index); `components/header/site-header.tsx:14-26` (reads unread count via MOCK_USER_ID); `components/header/notification-bell.tsx:8` (prop-driven, no write path); no `insertNotification` / `markRead` action found across `lib/` or `app/`.
- Potential improvement: Add a `"use server"` action triggered by `createKudos` to insert a notification row for the receiver, and a second action to mark all as read when the bell panel is opened. Supabase Realtime can push count updates to the client via `supabase.channel()` — no additional infrastructure needed.
- Customer-value signal: employee productivity
- Value: high
- Effort hint: low
- Risk if untouched: The bell UI exists and shows a badge, but never reflects real events — employees see a broken notification promise, eroding trust in the platform.

---

- Status: opportunity
- Category: new-features
- Observation: `fetchKudosStats` already queries per-user received/sent/hearts counts, and `hero-badge.ts` maps received count to Rising/Super/Legend tiers, but there is no aggregated leaderboard view showing department-level or platform-wide top recipients.
- Evidence: `lib/kudos/queries.ts:136-161` (`fetchKudosStats` queries `kudos` and `kudos_likes` for single user); `lib/kudos/hero-badge.ts:12` (`heroRankFromReceived`); `supabase/migrations/0004_kudos_schema.sql:5` (`department_id` on users); no leaderboard route or query found in `app/` or `lib/`.
- Potential improvement: Add a `/sun-kudos/leaderboard` sub-page backed by a single Supabase query (`GROUP BY receiver_id ORDER BY count DESC`) with optional department filter. Existing `departments` table and `kudos_receiver_idx` index make this a low-effort aggregation.
- Customer-value signal: employee productivity | platform capability
- Value: medium
- Effort hint: low
- Risk if untouched: Award nomination decisions lack objective signal; recognising high-contributors relies entirely on memory rather than data, reducing fairness perception.

---

- Status: opportunity
- Category: new-features
- Observation: The kudos board loads all posts in bulk (`fetchKudosBoard` — 6 parallel queries); there is no search or filter by keyword beyond the existing client-side hashtag filter. `hashtags` and `kudos` tables are in place, but no full-text search route or Supabase FTS index exists.
- Evidence: `lib/kudos/queries.ts:31` (`fetchKudosBoard` fetches all kudos); `supabase/migrations/0004_kudos_schema.sql:13-17` (`hashtags` table, `kudos.content text`); no `tsquery`/`tsvector` column, no search route in `app/`.
- Potential improvement: Add a PostgreSQL `tsvector` column on `kudos.content` + GIN index via a migration, expose a `/api/kudos/search` Next.js route handler, and wire a search input on the kudos board. Supabase's `textSearch` helper makes this stack-native.
- Customer-value signal: employee productivity | platform capability
- Value: medium
- Effort hint: medium
- Risk if untouched: As kudos volume grows across the event period, employees cannot retrieve specific recognition moments; the board becomes a chronological dump with limited recall value.

---

- Status: opportunity
- Category: new-features
- Observation: `supabase/config.toml` contains a commented-out SendGrid SMTP block and an `OPENAI_API_KEY` env reference; no email delivery code exists in `lib/` or Lambda. The Lambda Terraform module is provisioned but has no function code in the repo.
- Evidence: `supabase/config.toml:234,237` (`host = "smtp.sendgrid.net"`, `pass = "env(SENDGRID_API_KEY)"` — commented out); `infra/modules/lambda/main.tf:1` (Lambda module provisioned, `var.container_image`); no `sendEmail` / digest function found in `lib/` or `app/`.
- Potential improvement: Implement a weekly kudos digest Lambda (Python 3.14, matching existing runtime in `terraform.tfvars:32`) triggered by EventBridge on a cron schedule. The Lambda queries Supabase REST API, renders an HTML summary of top kudos/kudos-received-by-user for the week, and sends via SendGrid SMTP — reusing already-provisioned infra and secret references.
- Customer-value signal: employee productivity | platform capability
- Value: medium
- Effort hint: medium
- Risk if untouched: Employees who do not visit the platform regularly miss recognition moments; digest email is the primary re-engagement mechanism for infrequent users during the award window.

---

- Status: opportunity
- Category: new-features
- Observation: `supabase/config.toml:316` lists `slack` as a supported Supabase OAuth provider, and no Slack-specific app manifest or outbound webhook exists. Kudos are currently silo'd in the web app with no feed into communication tools the team uses daily.
- Evidence: `supabase/config.toml:316` (`'twitter', 'x', 'slack', …` supported providers list); `07-product-surface.md:26` (no host-platform manifest found); no outbound webhook call in `lib/kudos/actions.ts`.
- Potential improvement: Add an optional `SLACK_WEBHOOK_URL` env var; when set, `createKudos` server action posts a formatted Slack message to a `#kudos` channel after DB insert. This is a 20-line addition to `lib/kudos/actions.ts` with zero schema changes.
- Customer-value signal: employee productivity | platform capability
- Value: medium
- Effort hint: low
- Risk if untouched: Sun* employees spend most of their day in Slack; keeping kudos web-only limits visibility and participation rate during the award period.

---

- Status: opportunity
- Category: new-features
- Observation: The admin dashboard route exists (`app/[locale]/admin-dashboard/page.tsx`) but no data export capability is present. Award nominees and kudos volume are tracked in structured tables, yet admins have no way to extract a CSV/XLSX snapshot for award committee review.
- Evidence: `07-product-surface.md:9` (`admin-dashboard/page.tsx` listed as route); `supabase/migrations/0004_kudos_schema.sql:19-26` (`kudos` table with sender/receiver/content/created_at); `supabase/migrations/0001_initial_schema.sql:12-20` (`awards` table); no export route in `app/` (`find app -name "route.ts"` returned empty per `07-product-surface.md:14`).
- Potential improvement: Add a `app/[locale]/admin-dashboard/export/route.ts` Next.js route handler that streams a CSV of kudos (sender, receiver, dept, hashtags, like count, timestamp) using the existing Supabase server client. Gated by `users.role = 'admin'` RLS or server-side role check.
- Customer-value signal: operational efficiency | compliance
- Value: high
- Effort hint: low
- Risk if untouched: Award committee must manually screenshot or query the DB to compile nominee shortlists — high manual effort at a time-sensitive stage of the awards cycle.

---

- Status: opportunity
- Category: new-features
- Observation: `lib/auth/mock-auth-context.tsx` hardcodes a single mock user and `SENDER_ID = "00000000-0000-0000-0000-000000000001"` is hardcoded in both `actions.ts` and `site-header.tsx`. Supabase supports Google OAuth and WorkOS (SSO) out of the box; `config.toml` lists both as provider options. Real auth is a prerequisite for per-user notifications, leaderboard, and export gating.
- Evidence: `lib/auth/mock-auth-context.tsx:1` (mock auth drives all UI auth state); `lib/kudos/actions.ts:23` (`SENDER_ID = "00000000-0000-0000-0000-000000000001"`); `components/header/site-header.tsx:12` (`MOCK_USER_ID`); `supabase/config.toml:314-316` (Google, Azure, WorkOS, Slack listed as supported OAuth providers).
- Potential improvement: Wire Supabase Auth with Google OAuth (or Azure AD for corporate SSO) — replace `MockAuthProvider` with `@supabase/ssr` session provider. This unblocks all per-user features (notifications, leaderboard, export ACL) and is the highest-leverage single change given the stack already has Supabase Auth configured.
- Customer-value signal: risk reduction | platform capability | employee productivity
- Value: high
- Effort hint: medium
- Risk if untouched: All per-user features (notifications, export gating, accurate kudos attribution) are blocked; the platform cannot distinguish users in production, making award integrity unverifiable.
