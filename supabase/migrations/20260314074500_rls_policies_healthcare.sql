-- Row Level Security policies for healthcare schema

-- Helper functions
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.users where id = auth.uid();
$$;

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.appointments enable row level security;
alter table public.symptoms enable row level security;
alter table public.medical_records enable row level security;
alter table public.messages enable row level security;

-- organizations
create policy organizations_select_same_org
on public.organizations
for select
using (id = public.current_user_org_id());

create policy organizations_admin_write
on public.organizations
for all
using (
  id = public.current_user_org_id()
  and public.current_user_role() = 'admin'
)
with check (
  id = public.current_user_org_id()
  and public.current_user_role() = 'admin'
);

-- users
create policy users_select_same_org
on public.users
for select
using (organization_id = public.current_user_org_id());

create policy users_admin_insert
on public.users
for insert
with check (
  public.current_user_role() = 'admin'
  and organization_id = public.current_user_org_id()
);

create policy users_admin_or_self_update
on public.users
for update
using (
  id = auth.uid()
  or (public.current_user_role() = 'admin' and organization_id = public.current_user_org_id())
)
with check (
  id = auth.uid()
  or (public.current_user_role() = 'admin' and organization_id = public.current_user_org_id())
);

create policy users_admin_delete
on public.users
for delete
using (
  public.current_user_role() = 'admin'
  and organization_id = public.current_user_org_id()
);

-- patients
create policy patients_select
on public.patients
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = patients.user_id
      and u.organization_id = public.current_user_org_id()
      and (
        u.id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
);

create policy patients_admin_provider_write
on public.patients
for all
using (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.users u
    where u.id = patients.user_id
      and u.organization_id = public.current_user_org_id()
  )
)
with check (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.users u
    where u.id = patients.user_id
      and u.organization_id = public.current_user_org_id()
  )
);

-- providers
create policy providers_select
on public.providers
for select
using (
  exists (
    select 1
    from public.users u
    where u.id = providers.user_id
      and u.organization_id = public.current_user_org_id()
      and (
        u.id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
);

create policy providers_admin_write
on public.providers
for all
using (
  public.current_user_role() = 'admin'
  and exists (
    select 1
    from public.users u
    where u.id = providers.user_id
      and u.organization_id = public.current_user_org_id()
  )
)
with check (
  public.current_user_role() = 'admin'
  and exists (
    select 1
    from public.users u
    where u.id = providers.user_id
      and u.organization_id = public.current_user_org_id()
  )
);

-- appointments
create policy appointments_select
on public.appointments
for select
using (
  exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = appointments.patient_id
      and pu.organization_id = public.current_user_org_id()
  )
  and (
    public.current_user_role() in ('admin', 'provider')
    or exists (
      select 1
      from public.patients p2
      where p2.id = appointments.patient_id
        and p2.user_id = auth.uid()
    )
  )
);

create policy appointments_admin_provider_write
on public.appointments
for all
using (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = appointments.patient_id
      and pu.organization_id = public.current_user_org_id()
  )
)
with check (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = appointments.patient_id
      and pu.organization_id = public.current_user_org_id()
  )
);

create policy appointments_patient_insert_own
on public.appointments
for insert
with check (
  public.current_user_role() = 'patient'
  and exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = appointments.patient_id
      and p.user_id = auth.uid()
      and pu.organization_id = public.current_user_org_id()
  )
);

-- symptoms
create policy symptoms_select
on public.symptoms
for select
using (
  exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = symptoms.patient_id
      and pu.organization_id = public.current_user_org_id()
      and (
        p.user_id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
);

create policy symptoms_patient_or_clinician_write
on public.symptoms
for all
using (
  exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = symptoms.patient_id
      and pu.organization_id = public.current_user_org_id()
      and (
        p.user_id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
)
with check (
  exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = symptoms.patient_id
      and pu.organization_id = public.current_user_org_id()
      and (
        p.user_id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
);

-- medical_records
create policy medical_records_select
on public.medical_records
for select
using (
  exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = medical_records.patient_id
      and pu.organization_id = public.current_user_org_id()
      and (
        p.user_id = auth.uid()
        or public.current_user_role() in ('admin', 'provider')
      )
  )
);

create policy medical_records_admin_provider_write
on public.medical_records
for all
using (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = medical_records.patient_id
      and pu.organization_id = public.current_user_org_id()
  )
)
with check (
  public.current_user_role() in ('admin', 'provider')
  and exists (
    select 1
    from public.patients p
    join public.users pu on pu.id = p.user_id
    where p.id = medical_records.patient_id
      and pu.organization_id = public.current_user_org_id()
  )
);

-- messages
create policy messages_select_participants
on public.messages
for select
using (
  (sender_id = auth.uid() or receiver_id = auth.uid())
  and exists (
    select 1
    from public.users s
    join public.users r on r.id = messages.receiver_id
    where s.id = messages.sender_id
      and s.organization_id = public.current_user_org_id()
      and r.organization_id = public.current_user_org_id()
  )
);

create policy messages_insert_sender_only
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.users s
    join public.users r on r.id = messages.receiver_id
    where s.id = auth.uid()
      and s.organization_id = public.current_user_org_id()
      and r.organization_id = public.current_user_org_id()
  )
);

create policy messages_sender_delete
on public.messages
for delete
using (sender_id = auth.uid());
