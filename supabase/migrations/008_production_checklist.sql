-- Per-card production tracking prevents a printed QR being paired with the wrong NFC chip.
alter table public.cards add column if not exists nfc_written boolean not null default false;
alter table public.cards add column if not exists qr_printed boolean not null default false;
alter table public.cards add column if not exists tap_tested boolean not null default false;
alter table public.cards add column if not exists scan_tested boolean not null default false;
alter table public.cards add column if not exists ready_to_sell boolean not null default false;

alter table public.cards drop constraint if exists ready_card_passed_production;
alter table public.cards add constraint ready_card_passed_production check (
  not ready_to_sell or (nfc_written and qr_printed and tap_tested and scan_tested)
);
