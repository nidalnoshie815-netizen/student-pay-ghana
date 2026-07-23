
alter table public.profiles
  add column if not exists students jsonb not null default '[]'::jsonb,
  add column if not exists address text,
  add column if not exists occupation text,
  add column if not exists emergency_name text,
  add column if not exists emergency_phone text,
  add column if not exists preferred_language text,
  add column if not exists date_of_birth text;
