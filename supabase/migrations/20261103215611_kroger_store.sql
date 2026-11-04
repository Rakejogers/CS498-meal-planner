-- The Kroger store a user shops at. Product search, prices, and the cart are
-- all per store, so grocery matching reads this.
--
-- Name and address are a copy of what Kroger returned when the store was
-- chosen, so settings can show it without calling Kroger. The server looks the
-- store up by ID before saving, so these come from Kroger, not the form.
--
-- Kroger login tokens are not stored here. They live in an httpOnly cookie
-- (lib/kroger/session.ts) so browser code can't read them.

alter table public.profiles
  add column kroger_location_id text
    check (kroger_location_id ~ '^[A-Za-z0-9]{1,20}$'),
  add column kroger_store_name text
    check (char_length(kroger_store_name) between 1 and 120),
  add column kroger_store_address text
    check (char_length(kroger_store_address) between 1 and 200),
  -- A store is all three or none.
  add constraint profiles_kroger_store_complete check (
    (kroger_location_id is null) = (kroger_store_name is null)
    and (kroger_location_id is null) = (kroger_store_address is null)
  );

grant update (kroger_location_id, kroger_store_name, kroger_store_address)
  on public.profiles to authenticated;
