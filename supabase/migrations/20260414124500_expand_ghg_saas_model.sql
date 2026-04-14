create table if not exists public.ghg_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  name text not null,
  country_code text not null default 'PL',
  city text,
  address_line text,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_emission_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  location_id uuid references public.ghg_locations(id) on delete set null,
  source_key text not null,
  source_name text not null,
  scope text not null check (scope in ('scope1', 'scope2', 'scope3')),
  method text not null,
  default_activity_unit text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_reporting_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  label text not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  unique (organization_id, label)
);

create table if not exists public.ghg_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  reporting_period_id uuid not null references public.ghg_reporting_periods(id) on delete cascade,
  report_year integer not null check (report_year between 2000 and 2100),
  company_name text not null,
  inventory_boundary text not null,
  consolidation_approach text not null,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'published')),
  submitted_by_user_id text,
  approved_by_user_id text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_report_activities (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.ghg_reports(id) on delete cascade,
  source_key text not null,
  source_name text not null,
  scope text not null check (scope in ('scope1', 'scope2', 'scope3')),
  method text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  activity_amount numeric not null default 0,
  activity_unit text not null,
  emission_factor numeric not null default 0,
  emission_factor_unit text not null,
  uncertainty_pct numeric not null default 0,
  co2e_kg numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_report_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.ghg_reports(id) on delete cascade,
  reviewer_user_id text not null,
  decision text not null check (decision in ('changes_requested', 'approved')),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  actor_user_id text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ghg_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.ghg_organizations(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('owner', 'admin', 'editor', 'reviewer', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.ghg_billing_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.ghg_organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_code text not null default 'starter',
  subscription_status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ghg_report_snapshots
  add column if not exists organization_id uuid references public.ghg_organizations(id) on delete cascade,
  add column if not exists report_id uuid references public.ghg_reports(id) on delete set null;

create index if not exists idx_ghg_locations_org on public.ghg_locations(organization_id);
create index if not exists idx_ghg_sources_org on public.ghg_emission_sources(organization_id);
create index if not exists idx_ghg_periods_org on public.ghg_reporting_periods(organization_id);
create index if not exists idx_ghg_reports_org on public.ghg_reports(organization_id);
create index if not exists idx_ghg_activities_report on public.ghg_report_activities(report_id);
create index if not exists idx_ghg_audit_org on public.ghg_audit_logs(organization_id, created_at);

alter table public.ghg_locations enable row level security;
alter table public.ghg_emission_sources enable row level security;
alter table public.ghg_reporting_periods enable row level security;
alter table public.ghg_reports enable row level security;
alter table public.ghg_report_activities enable row level security;
alter table public.ghg_report_reviews enable row level security;
alter table public.ghg_audit_logs enable row level security;
alter table public.ghg_memberships enable row level security;
alter table public.ghg_billing_accounts enable row level security;

drop policy if exists "Tylko service_role ghg_locations" on public.ghg_locations;
create policy "Tylko service_role ghg_locations" on public.ghg_locations for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_emission_sources" on public.ghg_emission_sources;
create policy "Tylko service_role ghg_emission_sources" on public.ghg_emission_sources for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_reporting_periods" on public.ghg_reporting_periods;
create policy "Tylko service_role ghg_reporting_periods" on public.ghg_reporting_periods for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_reports" on public.ghg_reports;
create policy "Tylko service_role ghg_reports" on public.ghg_reports for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_report_activities" on public.ghg_report_activities;
create policy "Tylko service_role ghg_report_activities" on public.ghg_report_activities for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_report_reviews" on public.ghg_report_reviews;
create policy "Tylko service_role ghg_report_reviews" on public.ghg_report_reviews for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_audit_logs" on public.ghg_audit_logs;
create policy "Tylko service_role ghg_audit_logs" on public.ghg_audit_logs for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_memberships" on public.ghg_memberships;
create policy "Tylko service_role ghg_memberships" on public.ghg_memberships for all to service_role using (true) with check (true);
drop policy if exists "Tylko service_role ghg_billing_accounts" on public.ghg_billing_accounts;
create policy "Tylko service_role ghg_billing_accounts" on public.ghg_billing_accounts for all to service_role using (true) with check (true);
