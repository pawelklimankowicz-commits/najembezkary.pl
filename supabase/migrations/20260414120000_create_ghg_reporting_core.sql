create table if not exists public.ghg_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null default 'PL',
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_year integer not null check (report_year between 2000 and 2100),
  company_name text not null,
  total_co2e_kg numeric not null default 0,
  scope1_co2e_kg numeric not null default 0,
  scope2_co2e_kg numeric not null default 0,
  scope3_co2e_kg numeric not null default 0,
  uncertainty_kg numeric not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ghg_report_snapshots_year
  on public.ghg_report_snapshots(report_year);

create index if not exists idx_ghg_report_snapshots_company
  on public.ghg_report_snapshots(company_name);

create table if not exists public.ghg_emission_factors (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  activity_unit text not null,
  emission_factor numeric not null check (emission_factor >= 0),
  factor_unit text not null,
  scope text not null check (scope in ('scope1', 'scope2', 'scope3')),
  method text not null,
  valid_from date not null,
  valid_to date,
  source_reference text,
  created_at timestamptz not null default now(),
  unique (source_key, activity_unit, valid_from)
);

create index if not exists idx_ghg_emission_factors_scope
  on public.ghg_emission_factors(scope);

alter table public.ghg_organizations enable row level security;
alter table public.ghg_report_snapshots enable row level security;
alter table public.ghg_emission_factors enable row level security;

drop policy if exists "Tylko service_role ghg_organizations" on public.ghg_organizations;
create policy "Tylko service_role ghg_organizations" on public.ghg_organizations
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Tylko service_role ghg_report_snapshots" on public.ghg_report_snapshots;
create policy "Tylko service_role ghg_report_snapshots" on public.ghg_report_snapshots
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Tylko service_role ghg_emission_factors" on public.ghg_emission_factors;
create policy "Tylko service_role ghg_emission_factors" on public.ghg_emission_factors
  for all
  to service_role
  using (true)
  with check (true);
