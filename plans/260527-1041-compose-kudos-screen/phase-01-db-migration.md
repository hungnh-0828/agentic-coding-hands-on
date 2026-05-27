# Phase 01 — DB Migration 0005 (title / anonymous / images + RLS write)

Track: B (backend) · Priority: P1 · Status: completed · Blocked by: —

## Context
- Current schema: `supabase/migrations/0004_kudos_schema.sql` (kudos has only id, sender_id, receiver_id, content, created_at + `sender_not_receiver` check). Write RLS exists only on `kudos_likes`.
- Clarifications #1: add title/is_anonymous/anonymous_name/image_urls + RLS write for `kudos` and `kudos_hashtags`. Store image data URLs in `image_urls` (no Supabase Storage).

## Files
- Create: `supabase/migrations/0005_compose_kudos.sql`
- Read: `supabase/migrations/0004_kudos_schema.sql` (conventions: idempotent `if not exists`, demo `to anon, authenticated`)

## Implementation steps
1. Add columns to `public.kudos` (all idempotent, with defaults so existing rows stay valid):
   - `title text not null default ''`
   - `is_anonymous boolean not null default false`
   - `anonymous_name text`
   - `image_urls text[] not null default '{}'`
2. Add demo write RLS policies (match 0004 naming style):
   - `"demo write kudos" on public.kudos for all to anon, authenticated using (true) with check (true)`
   - `"demo write kudos_hashtags" on public.kudos_hashtags for all to anon, authenticated using (true) with check (true)`
3. Use `drop policy if exists` before each `create policy` to keep migration re-runnable.
4. Keep file ASCII-clean; comment header explaining the compose feature, matching 0004 tone.
5. Apply locally (`supabase db reset` or `supabase migration up` per project convention) so phase-02 queries can select `title`.

## Data flow
Write path enabled: `createKudos` (phase-02) → INSERT into `kudos` (now incl. title, is_anonymous, anonymous_name, image_urls) + INSERT into `kudos_hashtags`. RLS `for all` permits these under the demo anon/authenticated roles.

## Todo
- [ ] Create `0005_compose_kudos.sql` with 4 columns (idempotent)
- [ ] Add write policy for `kudos`
- [ ] Add write policy for `kudos_hashtags`
- [ ] `drop policy if exists` guards on each policy
- [ ] Apply migration locally; confirm `\d public.kudos` shows new columns
- [ ] Confirm existing seed rows still valid (defaults applied)

## Success criteria
- Migration applies cleanly on a fresh `db reset` AND re-applies without error.
- `select title, is_anonymous, anonymous_name, image_urls from public.kudos limit 1;` succeeds.
- An anon-role INSERT into `kudos` and `kudos_hashtags` succeeds (RLS allows).

## Risk assessment
| Risk | L×I | Mitigation |
|------|-----|-----------|
| `not null` cols break existing rows | Low×High | Add `default ''` / `default false` / `default '{}'` so backfill is automatic |
| Duplicate policy name on re-run | Med×Low | `drop policy if exists` before create |
| RLS still blocks insert (forgot a table) | Med×High | Cover BOTH kudos and kudos_hashtags; test an anon insert |
| Migration not applied before phase-02 dev | Med×Med | Step 5 explicit; phase-02 success criteria re-check columns |

## Security
Demo-grade permissive RLS (consistent with existing convention). Add TODO(auth) comment: tighten to `auth.uid() = sender_id` once real auth lands.

## Next
Unblocks phase-02 (queries + action).
