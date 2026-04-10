create table if not exists public.client_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  owner_city text not null,
  owner_address text not null,
  owner_zip text not null,
  owner_pesel text,
  owner_identity_document text,
  email text not null,
  owner_phone text not null,
  property_address text not null,
  property_city text not null,
  property_zip text,
  property_type text not null,
  property_area numeric,
  property_floor integer,
  rental_platform text[] not null default '{}',
  rental_since text,
  quiz_q3 text not null,
  owner_units_json jsonb,
  ip_address inet,
  user_agent text,
  referrer text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_client_submissions_email on public.client_submissions(email);
create index if not exists idx_client_submissions_submitted_at on public.client_submissions(submitted_at);
create index if not exists idx_client_submissions_owner_phone on public.client_submissions(owner_phone);

alter table public.client_submissions enable row level security;

drop policy if exists "Tylko service_role" on public.client_submissions;
create policy "Tylko service_role" on public.client_submissions
  for all
  to service_role
  using (true)
  with check (true);

