---
item_index: 17
item_slug: add-admin-data-export-endpoint
track: technical
decision: REVISE
---

# Audits

- **Clause:** Admin dashboard route exists (`app/[locale]/admin-dashboard/page.tsx`)
  - **Evidence:** `app/[locale]/admin-dashboard/page.tsx` exists and renders a "Coming Soon" placeholder (`app/[locale]/admin-dashboard/page.tsx:16`). Confirmed by direct file read.
  - **Verdict:** correct

- **Clause:** No data export capability present
  - **Evidence:** `find app -name "route.ts"` returned empty (confirmed by repo search — no `route.ts` files exist anywhere under `app/`). No `export/` subdirectory under `app/[locale]/admin-dashboard/`.
  - **Verdict:** correct

- **Clause:** Award nominees and kudos volume are tracked in structured tables (`supabase/migrations/0004_kudos_schema.sql:19-26`)
  - **Evidence:** `supabase/migrations/0004_kudos_schema.sql:19-26` defines `public.kudos` table with `sender_id`, `receiver_id`, `content`, `created_at`; `supabase/migrations/0001_initial_schema.sql:12-20` defines `awards` table. Both confirmed.
  - **Verdict:** correct

- **Clause:** No way to extract a CSV/XLSX snapshot for award committee review
  - **Evidence:** Repo-wide grep for export route, CSV, or download handler under `app/` and `lib/` returned no results. No `export` route file exists.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — item is coherent and every Need claim is evidenced. Check 5 (security guard) fires a REVISE: the Proposed solution says "Gate by `users.role = 'admin'` RLS or server-side role check," but (a) all current RLS policies on kudos tables are permissive (`to anon, authenticated using (true)` — `supabase/migrations/0004_kudos_schema.sql:55-60`), so an RLS-based admin gate does not exist yet, and (b) auth is mock/client-side only (`lib/auth/mock-auth-context.tsx:1`) with no server-side session until item-19 lands — meaning a shipped `route.ts` handler today would be unauthenticated and would stream full kudos CSV to any caller. The Proposed solution must be revised to sequence this feature after item-19 (real Supabase Auth) and add an explicit deployment guard.

# Revised item

## Add admin data export endpoint

- **Value:** high
- **Need:** Admin dashboard route exists (`app/[locale]/admin-dashboard/page.tsx`) but no data export capability is present; award nominees and kudos volume are tracked in structured tables with no way to extract a CSV snapshot for award committee review (`supabase/migrations/0004_kudos_schema.sql:19-26`); `find app -name "route.ts"` returned empty.
- **Benefits:** Operational efficiency — award committee can download a CSV of kudos (sender, receiver, dept, hashtags, like count, timestamp) instead of manually querying the DB or taking screenshots during the time-sensitive award cycle.
- **Proposed solution:** Add `app/[locale]/admin-dashboard/export/route.ts` as a Next.js route handler that streams a CSV of kudos using the existing Supabase server client. **This endpoint MUST be sequenced after item-19 (real Supabase Auth):** without a server-side session, any auth gate is bypassable and the endpoint streams full kudos data to unauthenticated callers. Until item-19 lands, either disable the route via a feature flag (`ENABLE_ADMIN_EXPORT=false`) or return 503. Once item-19 is in, gate by verifying `session.user` role against `users.role = 'admin'` in a server-side DB lookup (not client-provided claim), and add an admin-only RLS policy on `kudos` for the authenticated role.
- **Effort hint:** low (route handler itself); medium (correctly auth-gated, requires item-19 first)
