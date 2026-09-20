-- Keep the explicit condition required by Supabase safe-update protection.
create or replace function public.delete_all_cards_and_reset_sequence()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
  sequence_name text;
begin
  if not public.is_app_admin() then
    raise exception 'Forbidden';
  end if;

  delete from public.cards where id is not null;
  get diagnostics deleted_count = row_count;

  sequence_name := pg_get_serial_sequence('public.cards', 'card_number');
  if sequence_name is not null then
    execute format('alter sequence %s restart with 1', sequence_name);
  end if;

  return deleted_count;
end;
$$;

revoke all on function public.delete_all_cards_and_reset_sequence() from public;
grant execute on function public.delete_all_cards_and_reset_sequence() to authenticated;
