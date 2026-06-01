---
item_index: 19
item_slug: wire-supabase-auth-with-oauth-sso-replacing-mockauthprovider-and-hardcoded-sender-id
track: technical
decision: REVISE
---

# Audits

- **Clause:** `MockAuthProvider` drives all UI auth state with no real Supabase Auth session (`lib/auth/mock-auth-context.tsx:1`)
  - **Evidence:** `lib/auth/mock-auth-context.tsx:1-46` confirmed — `MockAuthProvider` holds `isAuthenticated`, `role`, `displayName` as plain React `useState` with no persistence or Supabase integration. `app/[locale]/layout.tsx:8,52` wraps the entire app in `<MockAuthProvider>`. `lib/auth/auth-guard.tsx:12` uses `useMockAuth()` for the route gate. Claim fully corroborated.
  - **Verdict:** correct

- **Clause:** All server actions use hardcoded `SENDER_ID = "00000000-0000-0000-0000-000000000001"` (`lib/kudos/actions.ts:23`)
  - **Evidence:** `lib/kudos/actions.ts:23` — `const SENDER_ID = "00000000-0000-0000-0000-000000000001";` with `// TODO(auth)` comment. Used at `:79` (`assertValidCreateKudosInput(input, SENDER_ID)`) and `:97` (`sender_id: SENDER_ID`). Claim corroborated exactly.
  - **Verdict:** correct

- **Clause:** `supabase/config.toml:314-316` lists Google, Azure, WorkOS, Slack as supported OAuth providers but none are wired
  - **Evidence:** Lines 314-316 of `supabase/config.toml` are a comment block that lists the full set of *available* provider names in the Supabase CLI — `# Use an external OAuth provider. The full list of providers are: apple, azure, ...`. No Google, Azure, WorkOS, or Slack `[auth.external.*]` stanzas exist in the file; only `[auth.external.apple]` at line 317 with `enabled = false`. The claim misrepresents a generic comment as provider-specific configuration. The correct statement is that Supabase CLI supports these providers but none are configured in this project.
  - **Verdict:** wrong

- **Clause:** Admin-dashboard access control enforced only client-side via mock role state (`07-product-surface.md:23`)
  - **Evidence:** `lib/auth/auth-guard.tsx:9-28` — comment explicitly states "Client-side route gate. Mock auth lives only on the client"; uses `useMockAuth()` and `useEffect` redirect — no server-side session check. `app/[locale]/admin-dashboard/page.tsx` does not implement any server-side role guard. Claim corroborated.
  - **Verdict:** correct

- **Clause:** `lib/supabase/server.ts` provides DB access but Supabase Auth session is NOT connected
  - **Evidence:** `lib/supabase/server.ts:1-29` — `createServerClient` is wired for cookie read/write (DB access pattern) but `supabase.auth.getUser()` is never called anywhere in server components or actions (confirmed by `lib/kudos/actions.ts` which imports `createClient` only for DB queries, not session retrieval). Claim corroborated.
  - **Verdict:** correct

# Reason

Check 1 (holistic) — item is coherent and high-value; all core Need claims are evidenced, and the proposed solution (replace MockAuthProvider, derive sender_id from JWT, add server-side auth guard) directly addresses the identity spoofing vulnerability. One Need claim requires correction: `supabase/config.toml:314-316` is a generic comment listing all available Supabase OAuth providers, not a project-specific provider configuration — no Google, Azure, WorkOS, or Slack `[auth.external.*]` blocks exist. The title and proposed solution retain the OAuth/SSO framing (Supabase Auth does support these providers and the config infrastructure is present), but the Need citation must be corrected to avoid implying these are configured. Check 5 (hallucination guard) flags the same misrepresentation. All other checks pass: `high` value is defensible (identity spoofing vector closed before internal launch, prevents data integrity corruption on all kudos records), `internal` use-context is consistent (no monetization lever), Benefits are concrete, and no secrets or fabricated advisories are present.

# Revised item

## Wire Supabase Auth with OAuth SSO, replacing MockAuthProvider and hardcoded SENDER_ID

- **Value:** high
- **Need:** Authentication entirely mocked — `MockAuthProvider` drives all UI auth state with no real Supabase Auth session; all server actions use hardcoded `SENDER_ID = "00000000-0000-0000-0000-000000000001"` (`lib/kudos/actions.ts:23`). Admin-dashboard access control enforced only client-side via mock role state (`lib/auth/auth-guard.tsx:9`). `lib/supabase/server.ts` provides DB access but Supabase Auth session is not connected. Supabase CLI supports Google, Azure, WorkOS, Slack as OAuth providers but none are configured in `supabase/config.toml` (no `[auth.external.*]` stanzas present).
- **Benefits:** Closes the trivially-reachable identity spoofing vector before the platform launches internally (any browser user can currently submit kudos as any identity). Prevents every historical kudos record from carrying the wrong author, avoiding a costly data backfill. Eliminates trivial client-side role bypass for admin access. Unblocks all per-user features (notifications, leaderboard, export ACL) and makes award integrity verifiable. Highest-leverage single change given the stack already has Supabase Auth infrastructure (`@supabase/ssr` wired, DB client operational) — all downstream features depend on a real identity.
- **Proposed solution:** Replace `MockAuthProvider` with Supabase Auth (`@supabase/auth-js` + `@supabase/ssr`). Use `supabase.auth.signInWithOAuth` (Google/Azure AD, configured via `supabase/config.toml` provider stanzas) or `signInWithPassword`; read session server-side via `supabase.auth.getUser()` in server components and actions. Derive `sender_id` from the authenticated JWT on server actions — replace the hardcoded `SENDER_ID` constant at `lib/kudos/actions.ts:23`. Add an `auth-guard` that rejects unauthenticated requests at the action boundary. Resolves `lib/kudos/actions.ts:22,31,32` TODOs and enables `supabase/migrations/0002_rls_policies.sql` RLS enforcement. The mock context can remain for local dev/testing behind an env flag.
- **Effort hint:** high
