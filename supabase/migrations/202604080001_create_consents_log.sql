create table if not exists public.consents_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  session_id text,
  terms_accepted boolean not null default false,
  digital_content_consent boolean not null default false,
  analytics_consent boolean not null default false,
  marketing_consent boolean not null default false,
  terms_version text not null,
  privacy_policy_version text not null,
  ip_address inet,
  user_agent text,
  referrer text,
  email text,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_consents_log_order_id on public.consents_log(order_id);
create index if not exists idx_consents_log_email on public.consents_log(email);
create index if not exists idx_consents_log_consented_at on public.consents_log(consented_at);
create index if not exists idx_consents_log_ip on public.consents_log(ip_address);

comment on table public.consents_log is
  'Dowod udzielenia zgod RODO. NIE USUWAC bez analizy prawnej.';

comment on column public.consents_log.terms_version is
  'Wersja Regulaminu zaakceptowanego przez uzytkownika (data lub numer wersji)';

comment on column public.consents_log.digital_content_consent is
  'Zgoda wymagana przez art. 38 pkt 13 ustawy o prawach konsumenta';

comment on column public.consents_log.ip_address is
  'Adres IP uzytkownika w chwili udzielenia zgody — dowod dla UODO';

alter table public.consents_log enable row level security;

drop policy if exists "Tylko service_role" on public.consents_log;
create policy "Tylko service_role" on public.consents_log
  for all
  to service_role
  using (true)
  with check (true);
