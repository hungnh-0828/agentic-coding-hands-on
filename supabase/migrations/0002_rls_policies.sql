-- Enable RLS on all tables. Auth in this demo is UI-only, so policies are permissive
-- (anon role can read). Tighten when wiring real Supabase Auth.

alter table public.users         enable row level security;
alter table public.awards        enable row level security;
alter table public.notifications enable row level security;

create policy "public read awards"
  on public.awards for select
  to anon, authenticated
  using (true);

create policy "demo read users"
  on public.users for select
  to anon, authenticated
  using (true);

create policy "demo read notifications"
  on public.notifications for select
  to anon, authenticated
  using (true);
