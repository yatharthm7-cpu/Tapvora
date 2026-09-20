-- Public quote requests with private administrator-only access.
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text not null,
  phone text,
  email text,
  quantity integer not null default 1 check (quantity between 1 and 1000),
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  constraint quote_request_has_contact check (phone is not null or email is not null)
);

create index if not exists quote_requests_created_at_idx on public.quote_requests(created_at desc);
alter table public.quote_requests enable row level security;

drop policy if exists "Anyone can request a quote" on public.quote_requests;
create policy "Anyone can request a quote"
on public.quote_requests for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(trim(name)) between 2 and 120
  and char_length(trim(business_name)) between 2 and 160
);

drop policy if exists "Admins can read quote requests" on public.quote_requests;
create policy "Admins can read quote requests"
on public.quote_requests for select to authenticated using (public.is_app_admin());

drop policy if exists "Admins can update quote requests" on public.quote_requests;
create policy "Admins can update quote requests"
on public.quote_requests for update to authenticated
using (public.is_app_admin()) with check (public.is_app_admin());
