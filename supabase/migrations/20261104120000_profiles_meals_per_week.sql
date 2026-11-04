-- Meals per week: how many dinners the user wants planned each week. Plan
-- generation asks for this many.
--
-- Everyone starts at four until they say otherwise. A week holds at most seven
-- dinners (planned_meals.position), and the range matches lib/household.ts.

alter table public.profiles
  add column meals_per_week smallint not null default 4
  check (meals_per_week between 1 and 7);

grant update (meals_per_week) on public.profiles to authenticated;
