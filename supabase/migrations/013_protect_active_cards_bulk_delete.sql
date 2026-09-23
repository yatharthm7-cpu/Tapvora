-- Bulk deletion must never remove an active QR/NFC card or break its permanent link.
create or replace function public.delete_all_cards_and_reset_sequence()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
  highest_active_number bigint;
  sequence_name text;
begin
  if not public.is_app_admin() then
    raise exception 'Forbidden';
  end if;

  delete from public.cards where status <> 'active';
  get diagnostics deleted_count = row_count;

  select max(card_number)
  into highest_active_number
  from public.cards;

  sequence_name := pg_get_serial_sequence('public.cards', 'card_number');
  if sequence_name is not null then
    if highest_active_number is null then
      execute format('alter sequence %s restart with 1', sequence_name);
    else
      perform setval(sequence_name::regclass, highest_active_number, true);
    end if;
  end if;

  return deleted_count;
end;
$$;

revoke all on function public.delete_all_cards_and_reset_sequence() from public;
grant execute on function public.delete_all_cards_and_reset_sequence() to authenticated;
