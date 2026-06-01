---
item_index: 20
item_slug: add-supabase-session-refresh-to-middleware
track: technical
decision: REVISE
---

# Audits

- **Clause:** `@supabase/ssr` middleware pattern requires a session-refresh pass in middleware (calling `supabase.auth.getUser()` to extend cookies)
  - **Evidence:** `lib/supabase/server.ts:23` contains the inline comment "RSC: setAll throws — middleware refreshes the session instead", which confirms the `@supabase/ssr` pattern expects the middleware to handle session refresh; consistent with `@supabase/ssr` 0.10.3 docs pattern cited in `item_evidence`.
  - **Verdict:** correct

- **Clause:** current `proxy.ts`/`middleware.ts` only runs next-intl routing without any Supabase session refresh
  - **Evidence:** `proxy.ts:1-10` — file imports only `createMiddleware` from `next-intl/middleware` and exports a `config.matcher`; no `@supabase/ssr` import, no `createServerClient` call, no `supabase.auth.getUser()` call. Confirmed by direct read of `proxy.ts`.
  - **Verdict:** correct

- **Clause:** leaving authenticated sessions unable to renew on the server (`lib/supabase/server.ts:1-29`)
  - **Evidence:** `lib/supabase/server.ts:1-29` — `createServerClient` is wired with cookie read/write helpers but the file is never imported in `proxy.ts`; `item_evidence` confirms "the middleware file (`proxy.ts`) never imports it". This consequence is conditional on Supabase Auth being active (not yet wired), but the claim accurately describes what would happen once Auth is adopted without this fix.
  - **Verdict:** correct

- **Clause:** `03-architecture-shape.md:57` — "Auth layer split: `lib/auth/mock-auth-context.tsx` drives all UI auth state (client-side only); Supabase Auth session is NOT connected"
  - **Evidence:** `item_evidence` quotes this text and associates it with `03-architecture-shape.md:57`; `lib/kudos/actions.ts:22-23` (`SENDER_ID` hardcoded with `// TODO(auth)`) corroborates that no server-side session is established.
  - **Verdict:** correct

- **Clause:** `lib/kudos/actions.ts:23` — `SENDER_ID` hardcoded, confirming no session is available server-side
  - **Evidence:** Direct grep of `lib/kudos/actions.ts` confirms line 23: `const SENDER_ID = "00000000-0000-0000-0000-000000000001";` with comment `// TODO(auth): replace with session-derived user id when real Supabase Auth is in place.`
  - **Verdict:** correct

- **Clause:** Enables RLS policies relying on `auth.uid()` (already a TODO in `lib/kudos/actions.ts:31`) to be enforced
  - **Evidence:** `lib/kudos/actions.ts:31-32` — two `// TODO(auth)` comments: one about taking userId from session, one about tightening RLS to enforce `auth.uid() == user_id` on `kudos_likes` writes. Direct grep confirms these lines exist.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — item is coherent, all Need citations resolve, the proposed solution fits the `@supabase/ssr` stack, and the dependency on item-19 (real Supabase Auth adoption) is correctly scoped as a precondition rather than a flaw. Item is a distinct, separable concern from item-19: item-19 covers auth adoption, item-20 covers the specific middleware session-refresh wiring pattern that `@supabase/ssr` requires. The middleware filename discrepancy (`proxy.ts` vs `middleware.ts`) is acknowledged in the evidence and does not undermine the item. Check 6 (formatting) — the item_markdown is missing the required `**Benefits:**` bullet; schema mandates all five bullets (Value, Need, Benefits, Proposed solution, Effort hint) so REVISE is required to restore it. Value `high` is defensible under check 2: the concrete risk — silent JWT cookie expiry causing random 401s and unenforced RLS — constitutes a named production reliability risk and a security gap (unenforced `auth.uid()` RLS policies). Check 3 (use-context `internal`) passes — the item is about reliability/security, not monetization.

# Revised item

## Add Supabase session refresh to middleware

- **Value:** high
- **Need:** `@supabase/ssr` middleware pattern requires a session-refresh pass in middleware (calling `supabase.auth.getUser()` to extend cookies); current `proxy.ts` (the project's middleware file) only runs next-intl routing and performs no Supabase session refresh, leaving authenticated sessions unable to renew on the server (`lib/supabase/server.ts:1-29`; `lib/kudos/actions.ts:23` — `SENDER_ID` hardcoded with `// TODO(auth)` comment confirming no server-side session is established; RLS enforcement via `auth.uid()` is a noted TODO at `lib/kudos/actions.ts:31-32`).
- **Benefits:** Reliability — eliminates silent JWT cookie expiry that causes random 401s mid-session once real Supabase Auth is active. Security — enables `auth.uid()`-based RLS enforcement in `supabase/migrations/0002_rls_policies.sql`, preventing unenforced server-side authorization.
- **Proposed solution:** When real Supabase Auth is adopted (see item-19), extend `middleware.ts` to call `createServerClient` + `supabase.auth.getUser()` per the `@supabase/ssr` docs pattern. Note: the project's current middleware file is named `proxy.ts` — it must be renamed to `middleware.ts` (Next.js 16 auto-detection requirement) before this extension is applied.
- **Effort hint:** medium
