-- Lets activated business owners securely manage their own review destination.

create index if not exists businesses_contact_email_idx
on public.businesses (lower(contact_email))
where contact_email is not null;

-- Two different owners can legitimately use the same business name or destination.
alter table public.businesses drop constraint if exists businesses_name_review_unique;

drop policy if exists "Business owners can read own business" on public.businesses;
create policy "Business owners can read own business"
on public.businesses for select
to authenticated
using (
  contact_email is not null
  and lower(contact_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Business owners can read assigned cards" on public.cards;
create policy "Business owners can read assigned cards"
on public.cards for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = cards.business_id
      and businesses.contact_email is not null
      and lower(businesses.contact_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

drop function if exists public.activate_card(text, text, text, text, text);

create function public.activate_card(
  requested_code text,
  requested_pin text,
  requested_contact_name text,
  requested_contact_email text,
  requested_contact_phone text,
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
  clean_contact_name text := trim(requested_contact_name);
  clean_contact_email text := lower(trim(requested_contact_email));
  clean_contact_phone text := trim(requested_contact_phone);
  clean_name text := trim(requested_business_name);
  clean_address text := nullif(trim(coalesce(requested_address, '')), '');
  clean_url text := trim(requested_review_url);
begin
  if length(clean_contact_name) < 2 or length(clean_contact_name) > 120 then
    return query select false, 'Enter the owner name.';
    return;
  end if;

  if clean_contact_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    return query select false, 'Enter a valid email address.';
    return;
  end if;

  if length(clean_contact_phone) < 7 or length(clean_contact_phone) > 20 then
    return query select false, 'Enter a valid mobile number.';
    return;
  end if;

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

  select id into matched_business_id
  from public.businesses
  where lower(contact_email) = clean_contact_email
    and lower(name) = lower(clean_name)
  order by created_at
  limit 1;

  if matched_business_id is null then
    insert into public.businesses (
      name, review_url, address, contact_name, contact_email, contact_phone
    )
    values (
      clean_name, clean_url, clean_address, clean_contact_name, clean_contact_email, clean_contact_phone
    )
    returning id into matched_business_id;
  else
    update public.businesses
    set review_url = clean_url,
        address = coalesce(clean_address, address),
        contact_name = clean_contact_name,
        contact_phone = clean_contact_phone,
        updated_at = now()
    where id = matched_business_id;
  end if;

  update public.cards
  set business_id = matched_business_id,
      business_name = clean_name,
      destination_url = clean_url,
      status = 'active'
  where id = matched.id;

  return query select true, 'Card activated.';
end;
$$;

revoke all on function public.activate_card(text, text, text, text, text, text, text, text) from public;
grant execute on function public.activate_card(text, text, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.update_owned_business_review_url(
  requested_business_id uuid,
  requested_review_url text
)
returns table (updated boolean, result_message text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  clean_url text := trim(requested_review_url);
begin
  if auth.uid() is null or clean_email = '' then
    return query select false, 'Sign in to continue.';
    return;
  end if;

  if clean_url !~* '^https://(([a-z0-9-]+\.)*google\.com|g\.page|maps\.app\.goo\.gl|goo\.gl)(/|$)' then
    return query select false, 'Enter a valid Google Review or Google Maps link.';
    return;
  end if;

  if not exists (
    select 1 from public.businesses
    where id = requested_business_id
      and contact_email is not null
      and lower(contact_email) = clean_email
  ) then
    return query select false, 'Business not found for this account.';
    return;
  end if;

  update public.businesses
  set review_url = clean_url,
      updated_at = now()
  where id = requested_business_id;

  update public.cards
  set destination_url = clean_url
  where business_id = requested_business_id;

  return query select true, 'Review link updated.';
end;
$$;

revoke all on function public.update_owned_business_review_url(uuid, text) from public;
grant execute on function public.update_owned_business_review_url(uuid, text) to authenticated;
