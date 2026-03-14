-- Ensure auth signups are mirrored into application users for RLS-backed modules like chat.

do $$
begin
  insert into public.organizations (id, name)
  values ('00000000-0000-0000-0000-000000000001', 'Default Organization')
  on conflict (id) do nothing;
exception
  when unique_violation then
    null;
end
$$;

create or replace function public.normalize_app_role(metadata jsonb)
returns public.user_role
language sql
immutable
as $$
  select case metadata ->> 'role'
    when 'admin' then 'admin'::public.user_role
    when 'provider' then 'provider'::public.user_role
    when 'doctor' then 'provider'::public.user_role
    when 'patient' then 'patient'::public.user_role
    else null
  end;
$$;

create or replace function public.default_organization_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    (
      select id
      from public.organizations
      where id = '00000000-0000-0000-0000-000000000001'
    ),
    (
      select id
      from public.organizations
      order by created_at asc
      limit 1
    )
  );
$$;

create or replace function public.sync_auth_user_to_public_users()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role public.user_role;
begin
  resolved_role := coalesce(
    public.normalize_app_role(new.raw_user_meta_data),
    public.normalize_app_role(new.raw_app_meta_data),
    'patient'::public.user_role
  );

  insert into public.users (id, email, role, organization_id)
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@placeholder.local')),
    resolved_role,
    public.default_organization_id()
  )
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_synced_to_public_users on auth.users;

create trigger on_auth_user_synced_to_public_users
after insert or update of email, raw_user_meta_data, raw_app_meta_data
on auth.users
for each row
execute function public.sync_auth_user_to_public_users();

insert into public.users (id, email, role, organization_id)
select
  auth_users.id,
  coalesce(auth_users.email, concat(auth_users.id::text, '@placeholder.local')),
  coalesce(
    public.normalize_app_role(auth_users.raw_user_meta_data),
    public.normalize_app_role(auth_users.raw_app_meta_data),
    'patient'::public.user_role
  ),
  public.default_organization_id()
from auth.users as auth_users
left join public.users as app_users
  on app_users.id = auth_users.id
where app_users.id is null;
