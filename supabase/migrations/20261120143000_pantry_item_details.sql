-- Story 5: how much is left, and when the item was bought, opened, and expires.
-- Quantity and unit default so an older insert of just a name still succeeds.

alter table public.pantry_items
  add column quantity numeric(8, 2) not null default 1 check (quantity > 0 and quantity <= 9999),
  add column unit text not null default 'each'
    check (unit in (
      'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb',
      'each', 'clove', 'slice', 'can', 'bunch', 'pinch'
    )),
  add column bought_on date,
  add column expires_on date,
  add column opened_on date,
  add constraint pantry_items_dates_in_order check (
    (bought_on is null or opened_on is null or opened_on >= bought_on)
    and (bought_on is null or expires_on is null or expires_on >= bought_on)
    and (opened_on is null or expires_on is null or expires_on >= opened_on)
  );

grant insert (quantity, unit, bought_on, expires_on, opened_on)
  on public.pantry_items to authenticated;
grant update (quantity, unit, bought_on, expires_on, opened_on)
  on public.pantry_items to authenticated;
