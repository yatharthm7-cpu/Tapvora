-- Adds card deletion for authenticated Tapvora administrators.
-- Safe to run more than once.

drop policy if exists "Admins can delete cards" on public.cards;
create policy "Admins can delete cards"
on public.cards for delete
to authenticated
using (public.is_app_admin());
