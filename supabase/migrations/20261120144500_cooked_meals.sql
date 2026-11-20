-- Marking a dinner as cooked records when it happened and may use up a pantry
-- item completely, so a quantity of zero is allowed.

alter table public.planned_meals
  add column cooked_at timestamptz;

grant update (cooked_at) on public.planned_meals to authenticated;

alter table public.pantry_items
  drop constraint pantry_items_quantity_check;

alter table public.pantry_items
  add constraint pantry_items_quantity_check check (quantity >= 0 and quantity <= 9999);
