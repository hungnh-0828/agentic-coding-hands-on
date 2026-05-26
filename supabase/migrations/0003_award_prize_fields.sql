-- Adds prize metadata to awards: how many prizes, which unit type, and the money amount text.
-- prize_value is TEXT so awards with split prizes (e.g. Signature 2025) can carry two lines.

alter table public.awards
  add column if not exists prize_count int,
  add column if not exists unit_label  text,
  add column if not exists prize_value text;
