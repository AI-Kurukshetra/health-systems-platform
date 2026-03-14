-- Provider-managed patient profiles

create or replace function public.current_auth_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role'
  );
$$;

create table if not exists public.patient_profiles (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  dob date,
  gender text,
  address text,
  medical_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_profiles_provider_user_id
  on public.patient_profiles(provider_user_id);

create index if not exists idx_patient_profiles_full_name
  on public.patient_profiles(full_name);

alter table public.patient_profiles enable row level security;

create policy patient_profiles_provider_select
on public.patient_profiles
for select
using (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);

create policy patient_profiles_provider_insert
on public.patient_profiles
for insert
with check (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);

create policy patient_profiles_provider_update
on public.patient_profiles
for update
using (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
)
with check (
  provider_user_id = auth.uid()
  and public.current_auth_role() = 'provider'
);
