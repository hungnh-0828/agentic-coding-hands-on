---
item_index: 11
item_slug: tighten-rls-policies-to-prevent-anon-read-of-full-dataset
track: technical
decision: REVISE
---

# Audits

- **Clause:** RLS policies in `0002_rls_policies.sql` grant read access to all rows for `anon` and `authenticated` roles with no row-level filter
  - **Evidence:** `supabase/migrations/0002_rls_policies.sql:8-21` — three policies (`public read awards`, `demo read users`, `demo read notifications`) all use `to anon, authenticated using (true)` with no row predicate. Confirmed verbatim. However, the kudos, kudos_hashtags, kudos_likes, departments, and hashtags tables are covered by `supabase/migrations/0004_kudos_schema.sql:49-60`, not `0002_rls_policies.sql`. The Need attribution of the full dataset's permissive read to `0002_rls_policies.sql` alone is incomplete.
  - **Verdict:** wrong
- **Clause:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally client-exposed
  - **Evidence:** `06-security-compliance.md:54` — "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are intentionally client-exposed (Supabase anon key design pattern) (lib/supabase/client.ts)". Also confirmed by `lib/supabase/client.ts:8` and `lib/supabase/server.ts:11`.
  - **Verdict:** correct
- **Clause:** full dataset (users, kudos, awards) is readable by anyone with the published key
  - **Evidence:** users/awards: `supabase/migrations/0002_rls_policies.sql:8-21` (`using (true)`). kudos: `supabase/migrations/0004_kudos_schema.sql:57-60` (`using (true)` on kudos, kudos_hashtags, kudos_likes). All select policies are open to anon. Claim is factually correct but misattributes kudos exposure solely to `0002_rls_policies.sql`.
  - **Verdict:** correct
- **Clause:** OWASP audit — permissive RLS; `06-security-compliance.md:54`
  - **Evidence:** `06-security-compliance.md:54` documents anon-key client-exposure, NOT a permissive-RLS finding. The OWASP audit citation is `plans/reports/security-audit-260601-1019-app-and-infra.md` (commit 3585746) per `item_evidence`. Line 54 is a correct citation for anon-key exposure but is mischaracterised in context as the OWASP permissive-RLS reference.
  - **Verdict:** wrong

# Reason

Check 1 (holistic) — item is coherent and the core problem (permissive anon read, intentionally-exposed key) is real and evidenced; proposed solution is implementable in the stack. Two Need claims require correction: (1) permissive kudos-table RLS lives in `0004_kudos_schema.sql:57-60`, not solely `0002_rls_policies.sql`; (2) `06-security-compliance.md:54` documents anon-key client-exposure, not the OWASP permissive-RLS audit finding — the security-audit report (commit 3585746) is the correct OWASP source. Check 5 (hallucination guard) — the `06-security-compliance.md:54` parenthetical mischaracterises the line's content; corrected to cite the line for what it actually says. Additionally, the dependency on real auth (item-19) is implicit in the proposed solution but absent from Need — added explicitly to flag the sequencing constraint.

# Revised item

## Tighten RLS policies to prevent anon read of full dataset

- **Value:** high
- **Need:** RLS policies across `supabase/migrations/0002_rls_policies.sql` (users, awards, notifications) and `supabase/migrations/0004_kudos_schema.sql` (kudos, kudos_hashtags, kudos_likes, departments, hashtags) grant read access to all rows for both `anon` and `authenticated` roles with `USING (true)` — no row-level predicate. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally client-exposed (`06-security-compliance.md:54`), so the full dataset is readable by any unauthenticated caller possessing the published key. Permissive RLS confirmed by STRIDE/OWASP audit (`plans/reports/security-audit-260601-1019-app-and-infra.md`, commit 3585746). Meaningful `SELECT` tightening depends on real auth being wired (item-19); interim hardening of write policies is actionable now.
- **Benefits:** Prevents full dataset exfiltration via the publicly-available anon key once auth is live; interim write guards close the anon-write surface immediately regardless of auth status.
- **Proposed solution:** Phase 1 (actionable now, no auth dependency): replace permissive write policies (e.g., `demo write kudos_likes` in `0004_kudos_schema.sql:60`) with `USING (false)` to block all anon writes. Phase 2 (after item-19 auth is live): tighten `SELECT` policies to scope rows by `auth.uid()` or a department predicate. Cross-reference with STRIDE audit (commit 3585746) for the full policy change list.
- **Effort hint:** low
