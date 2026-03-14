-- Auth-backed medical records for AI clinical notes

alter table public.medical_records
  alter column patient_id drop not null,
  alter column provider_id drop not null;

alter table public.medical_records
  add column if not exists patient_profile_id uuid references public.patient_profiles(id) on delete cascade,
  add column if not exists provider_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_medical_records_patient_profile_id
  on public.medical_records(patient_profile_id);

create index if not exists idx_medical_records_provider_user_id
  on public.medical_records(provider_user_id);

drop policy if exists medical_records_select on public.medical_records;
drop policy if exists medical_records_admin_provider_write on public.medical_records;

create policy medical_records_provider_select
on public.medical_records
for select
using (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);

create policy medical_records_provider_insert
on public.medical_records
for insert
with check (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);
