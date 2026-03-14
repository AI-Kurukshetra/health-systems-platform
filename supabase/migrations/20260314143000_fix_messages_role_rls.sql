-- Stabilize auth role lookup for RLS-backed modules like realtime messaging.
-- JWT metadata can be missing or use the legacy "doctor" label; fall back to public.users.

create or replace function public.current_auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    case
      when auth.jwt() -> 'user_metadata' ->> 'role' = 'doctor' then 'provider'
      else auth.jwt() -> 'user_metadata' ->> 'role'
    end,
    case
      when auth.jwt() -> 'app_metadata' ->> 'role' = 'doctor' then 'provider'
      else auth.jwt() -> 'app_metadata' ->> 'role'
    end,
    (
      select case
        when users.role::text = 'doctor' then 'provider'
        else users.role::text
      end
      from public.users
      where users.id = auth.uid()
    )
  );
$$;
