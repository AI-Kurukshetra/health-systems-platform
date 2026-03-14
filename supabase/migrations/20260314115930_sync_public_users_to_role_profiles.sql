-- Keep legacy role-specific profile tables aligned with public.users records.

create or replace function public.ensure_role_profile_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'patient' then
    insert into public.patients (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  elsif new.role = 'provider' then
    insert into public.providers (user_id, license_number)
    values (new.id, concat('AUTO-', replace(new.id::text, '-', '')))
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_public_user_sync_role_profiles on public.users;

create trigger on_public_user_sync_role_profiles
after insert or update of role
on public.users
for each row
execute function public.ensure_role_profile_rows();

insert into public.patients (user_id)
select users.id
from public.users as users
left join public.patients as patients
  on patients.user_id = users.id
where users.role = 'patient'
  and patients.user_id is null;

insert into public.providers (user_id, license_number)
select
  users.id,
  concat('AUTO-', replace(users.id::text, '-', ''))
from public.users as users
left join public.providers as providers
  on providers.user_id = users.id
where users.role = 'provider'
  and providers.user_id is null;
