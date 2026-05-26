-- Kudos live-board schema: departments, hashtags, kudos posts, M:N kudos↔hashtags, likes.
-- Permissive RLS for the demo (same convention as 0002).

alter table public.users
  add column if not exists department_id uuid;

create table if not exists public.departments (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table if not exists public.hashtags (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  label text not null
);

create table if not exists public.kudos (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.users (id) on delete cascade,
  receiver_id uuid not null references public.users (id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  constraint sender_not_receiver check (sender_id <> receiver_id)
);

create index if not exists kudos_created_at_idx on public.kudos (created_at desc);
create index if not exists kudos_receiver_idx on public.kudos (receiver_id);
create index if not exists kudos_sender_idx   on public.kudos (sender_id);

create table if not exists public.kudos_hashtags (
  kudos_id   uuid references public.kudos (id) on delete cascade,
  hashtag_id uuid references public.hashtags (id) on delete cascade,
  primary key (kudos_id, hashtag_id)
);

create table if not exists public.kudos_likes (
  kudos_id   uuid references public.kudos (id) on delete cascade,
  user_id    uuid references public.users (id) on delete cascade,
  weight     int not null default 1 check (weight in (1, 2)),
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)
);

alter table public.users         add constraint users_department_fk
  foreign key (department_id) references public.departments (id) on delete set null;

alter table public.departments    enable row level security;
alter table public.hashtags       enable row level security;
alter table public.kudos          enable row level security;
alter table public.kudos_hashtags enable row level security;
alter table public.kudos_likes    enable row level security;

create policy "demo read departments"    on public.departments    for select to anon, authenticated using (true);
create policy "demo read hashtags"       on public.hashtags       for select to anon, authenticated using (true);
create policy "demo read kudos"          on public.kudos          for select to anon, authenticated using (true);
create policy "demo read kudos_hashtags" on public.kudos_hashtags for select to anon, authenticated using (true);
create policy "demo read kudos_likes"    on public.kudos_likes    for select to anon, authenticated using (true);
create policy "demo write kudos_likes"   on public.kudos_likes    for all    to anon, authenticated using (true) with check (true);
