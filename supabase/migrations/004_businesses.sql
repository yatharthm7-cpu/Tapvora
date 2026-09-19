-- Reusable business profiles for assigning the same destination to multiple cards.
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  review_url text not null check (review_url ~ '^https://'),
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_name_review_unique unique (name, review_url)
);

alter table public.cards add column if not exists business_id uuid references public.businesses(id) on delete set null;
create index if not exists cards_business_id_idx on public.cards(business_id);

insert into public.businesses (name, review_url)
select distinct business_name, destination_url
from public.cards
where business_name is not null and destination_url is not null
on conflict (name, review_url) do nothing;

update public.cards as card
set business_id = business.id
from public.businesses as business
where card.business_id is null
  and card.business_name = business.name
  and card.destination_url = business.review_url;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;

drop policy if exists "Admins can read businesses" on public.businesses;
create policy "Admins can read businesses" on public.businesses for select to authenticated using (public.is_app_admin());
drop policy if exists "Admins can insert businesses" on public.businesses;
create policy "Admins can insert businesses" on public.businesses for insert to authenticated with check (public.is_app_admin());
drop policy if exists "Admins can update businesses" on public.businesses;
create policy "Admins can update businesses" on public.businesses for update to authenticated using (public.is_app_admin()) with check (public.is_app_admin());
drop policy if exists "Admins can delete businesses" on public.businesses;
create policy "Admins can delete businesses" on public.businesses for delete to authenticated using (public.is_app_admin());
