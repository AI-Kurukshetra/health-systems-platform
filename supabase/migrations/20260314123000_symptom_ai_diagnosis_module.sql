-- Auth-backed symptom intake with AI diagnosis persistence

alter table public.symptoms
  alter column patient_id drop not null;

alter table public.symptoms
  add column if not exists patient_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists age integer,
  add column if not exists gender text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_symptoms_patient_user_id
  on public.symptoms(patient_user_id);

drop policy if exists symptoms_select on public.symptoms;
drop policy if exists symptoms_patient_or_clinician_write on public.symptoms;

create policy symptoms_patient_select
on public.symptoms
for select
using (
  patient_user_id = auth.uid()
  and public.current_auth_role() = 'patient'
);

create policy symptoms_patient_insert
on public.symptoms
for insert
with check (
  patient_user_id = auth.uid()
  and public.current_auth_role() = 'patient'
);
