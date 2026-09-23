-- Optional per-card artwork branding uploaded by the Tapvora administrator.
alter table public.cards
add column if not exists card_brand_name text,
add column if not exists card_logo_data text;

alter table public.cards drop constraint if exists cards_brand_name_length;
alter table public.cards add constraint cards_brand_name_length check (
  card_brand_name is null or length(card_brand_name) between 1 and 60
);

alter table public.cards drop constraint if exists cards_logo_data_format;
alter table public.cards add constraint cards_logo_data_format check (
  card_logo_data is null
  or (
    card_logo_data like 'data:image/png;base64,%'
    and length(card_logo_data) <= 1100000
  )
);
