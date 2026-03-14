-- Auth-backed realtime messaging policies and publication

drop policy if exists messages_select_participants on public.messages;
drop policy if exists messages_insert_sender_only on public.messages;
drop policy if exists messages_sender_delete on public.messages;

create policy messages_auth_select
on public.messages
for select
using (
  (sender_id = auth.uid() or receiver_id = auth.uid())
  and public.current_auth_role() in ('patient', 'provider')
);

create policy messages_auth_insert
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and public.current_auth_role() in ('patient', 'provider')
);

create policy messages_auth_delete
on public.messages
for delete
using (
  sender_id = auth.uid()
  and public.current_auth_role() in ('patient', 'provider')
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end
$$;
