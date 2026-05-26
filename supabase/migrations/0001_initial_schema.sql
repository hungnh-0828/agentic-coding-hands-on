-- Homepage SAA initial schema: users, awards, notifications.
-- Auth in this session is UI-only; users.role drives admin-vs-regular UI states.

create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  display_name text,
  role        text not null default 'regular' check (role in ('regular', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.awards (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  thumbnail_url text,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists awards_display_order_idx on public.awards (display_order);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  title      text not null,
  body       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id) where read_at is null;
