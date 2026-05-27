-- Compose Kudo: extend kudos with title (danh hiệu), anonymous sending, and attached images.
-- Also opens demo write access (RLS) to kudos + kudos_hashtags so the compose modal can insert.
-- Permissive RLS for the demo (same convention as 0002 / 0004).
-- TODO(auth): once real auth lands, tighten write policies to auth.uid() = sender_id.

alter table public.kudos
  add column if not exists title          text        not null default '',
  add column if not exists is_anonymous   boolean     not null default false,
  add column if not exists anonymous_name text,
  add column if not exists image_urls     text[]      not null default '{}';

-- kudos write (insert from the compose modal)
drop policy if exists "demo write kudos" on public.kudos;
create policy "demo write kudos"
  on public.kudos
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- kudos_hashtags write (link rows created alongside a new kudos)
drop policy if exists "demo write kudos_hashtags" on public.kudos_hashtags;
create policy "demo write kudos_hashtags"
  on public.kudos_hashtags
  for all
  to anon, authenticated
  using (true)
  with check (true);
