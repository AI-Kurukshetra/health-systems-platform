-- Auth-backed appointment scheduling

create table if not exists public.appointment_bookings (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  reason text,
  status public.appointment_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointment_bookings_patient_user_id
  on public.appointment_bookings(patient_user_id);

create index if not exists idx_appointment_bookings_provider_user_id
  on public.appointment_bookings(provider_user_id);

create index if not exists idx_appointment_bookings_scheduled_at
  on public.appointment_bookings(scheduled_at);

alter table public.appointment_bookings enable row level security;

create policy appointment_bookings_patient_select
on public.appointment_bookings
for select
using (
  patient_user_id = auth.uid()
  and public.current_auth_role() = 'patient'
);

create policy appointment_bookings_patient_insert
on public.appointment_bookings
for insert
with check (
  patient_user_id = auth.uid()
  and public.current_auth_role() = 'patient'
);

create policy appointment_bookings_provider_select
on public.appointment_bookings
for select
using (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);

create policy appointment_bookings_provider_update
on public.appointment_bookings
for update
using (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
)
with check (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);
