-- Healthcare platform initial schema
-- For Supabase Postgres

create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('admin', 'provider', 'patient');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled');

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Users (application profile mapped to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  organization_id uuid not null references public.organizations(id) on delete restrict
);

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  dob date,
  gender text,
  phone text
);

-- Providers
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  specialty text,
  license_number text not null unique
);

-- Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  date timestamptz not null,
  status public.appointment_status not null default 'scheduled'
);

-- Symptoms
create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  description text not null,
  ai_diagnosis text
);

-- Medical records
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  notes text not null,
  structured_data jsonb not null default '{}'::jsonb
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_users_organization_id on public.users(organization_id);

create index if not exists idx_patients_user_id on public.patients(user_id);
create index if not exists idx_providers_user_id on public.providers(user_id);

create index if not exists idx_appointments_patient_id on public.appointments(patient_id);
create index if not exists idx_appointments_provider_id on public.appointments(provider_id);
create index if not exists idx_appointments_date on public.appointments(date);

create index if not exists idx_symptoms_patient_id on public.symptoms(patient_id);

create index if not exists idx_medical_records_patient_id on public.medical_records(patient_id);
create index if not exists idx_medical_records_provider_id on public.medical_records(provider_id);

create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
