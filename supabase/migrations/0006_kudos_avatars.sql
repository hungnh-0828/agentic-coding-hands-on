-- Kudos board design alignment: avatar photos for users.
-- (kudos.image_urls already added in 0005). Hero badge + star count are derived
-- at query time from received-kudos counts, so no extra columns are needed.

alter table public.users
  add column if not exists avatar_url text;
