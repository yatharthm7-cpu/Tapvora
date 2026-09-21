-- One-time public activation for physical Tapvora cards.
alter table public.cards add column if not exists activation_pin text;

update public.cards
set activation_pin = upper(encode(gen_random_bytes(4), 'hex'))
where activation_pin is null;

alter table public.cards alter column activation_pin set default upper(encode(gen_random_bytes(4), 'hex'));
alter table public.cards alter column activation_pin set not null;

alter table public.cards drop constraint if exists cards_activation_pin_format;
alter table public.cards add constraint cards_activation_pin_format check (activation_pin ~ '^[A-F0-9]{8}$');

create or replace function public.get_card_activation_status(requested_code text)
returns table (card_number bigint, card_status text)
language sql
stable
security definer
set search_path = ''
as $$
  select cards.card_number, cards.status
  from public.cards as cards
  where cards.code = upper(requested_code)
  limit 1;
$$;

revoke all on function public.get_card_activation_status(text) from public;
grant execute on function public.get_card_activation_status(text) to anon, authenticated;

create or replace function public.activate_card(
  requested_code text,
  requested_pin text,
  requested_business_name text,
  requested_address text,
  requested_review_url text
)
returns table (activated boolean, result_message text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched public.cards%rowtype;
  matched_business_id uuid;
  clean_name text := trim(requested_business_name);
  clean_address text := nullif(trim(coalesce(requested_address, '')), '');
  clean_url text := trim(requested_review_url);
begin
  if length(clean_name) < 2 or length(clean_name) > 120 or length(coalesce(clean_address, '')) > 500 then
    return query select false, 'Enter valid business details.';
    return;
  end if;

  if clean_url !~* '^https://(([a-z0-9-]+\.)*google\.com|g\.page|maps\.app\.goo\.gl|goo\.gl)(/|$)' then
    return query select false, 'Enter a valid Google Review or Google Maps link.';
    return;
  end if;

  select * into matched
  from public.cards
  where code = upper(requested_code)
  for update;

  if not found then
    return query select false, 'Card not found.';
    return;
  end if;

  if matched.status <> 'unused' then
    return query select false, 'This card has already been activated or paused.';
    return;
  end if;

  if matched.activation_pin <> upper(trim(requested_pin)) then
    return query select false, 'The activation PIN is incorrect.';
    return;
  end if;

  insert into public.businesses as business (name, review_url, address)
  values (clean_name, clean_url, clean_address)
  on conflict (name, review_url) do update
    set address = coalesce(excluded.address, business.address),
        updated_at = now()
  returning id into matched_business_id;

  update public.cards
  set business_id = matched_business_id,
      business_name = clean_name,
      destination_url = clean_url,
      status = 'active'
  where id = matched.id;

  return query select true, 'Card activated.';
end;
$$;

revoke all on function public.activate_card(text, text, text, text, text) from public;
grant execute on function public.activate_card(text, text, text, text, text) to anon, authenticated;
