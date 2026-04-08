create table if not exists public.deletion_log (
  id uuid primary key default gen_random_uuid(),
  request_email text not null,
  request_received_at timestamptz not null,
  request_source text,
  request_notes text,
  executed_at timestamptz not null default now(),
  executed_by text not null,
  orders_anonymized integer default 0,
  consents_anonymized integer default 0,
  files_deleted integer default 0,
  requester_ip inet,
  requester_user_agent text,
  api_key_used text,
  status text not null,
  error_details text,
  retained_data_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_deletion_log_email on public.deletion_log(request_email);
create index if not exists idx_deletion_log_executed_at on public.deletion_log(executed_at);

alter table public.deletion_log enable row level security;

drop policy if exists "Tylko service_role" on public.deletion_log;
create policy "Tylko service_role" on public.deletion_log
  for all to service_role
  using (true)
  with check (true);

comment on table public.deletion_log is
  'Dowod wykonania prawa do bycia zapomnianym (art. 17 RODO). NIE USUWAC.';
