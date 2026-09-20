-- Optional physical address for saved business profiles.
alter table public.businesses
add column if not exists address text;

