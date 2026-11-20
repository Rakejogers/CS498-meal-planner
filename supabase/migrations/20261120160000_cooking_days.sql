-- Cooking days: how many days the user wants to cook each week. The other
-- dinners are leftovers from those cooks, so they can meal prep. A cook never
-- covers more nights than the dinners they asked for.
--
-- Existing households cook every dinner until they say otherwise.

alter table public.profiles
  add column cooking_days smallint;

update public.profiles
set cooking_days = meals_per_week
where cooking_days is null;

alter table public.profiles
  alter column cooking_days set default 4;

alter table public.profiles
  alter column cooking_days set not null;

alter table public.profiles
  add constraint profiles_cooking_days_check
  check (cooking_days between 1 and meals_per_week);

grant update (cooking_days) on public.profiles to authenticated;

-- A cooking session covers `nights` dinners. Leftover rows repeat the recipe
-- on the week so each night has a card, but they stay off the grocery list.
alter table public.planned_meals
  add column nights smallint not null default 1
  check (nights between 1 and 7);

alter table public.planned_meals
  add column counts_for_groceries boolean not null default true;

grant insert (nights, counts_for_groceries) on public.planned_meals to authenticated;
grant update (nights, counts_for_groceries) on public.planned_meals to authenticated;

-- Same save as before, plus how many nights a cook covers and whether the row
-- belongs on the grocery list. Missing keys keep the old behavior: one night,
-- and it counts.
create or replace function public.save_meal_plan(p_week_start date, p_meals jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  plan_id uuid;
begin
  if jsonb_array_length(p_meals) = 0 then
    raise exception 'A meal plan needs at least one meal' using errcode = '22023';
  end if;

  delete from public.meal_plans
  where user_id = (select auth.uid()) and week_start = p_week_start;

  insert into public.meal_plans (user_id, week_start)
  values ((select auth.uid()), p_week_start)
  returning id into plan_id;

  insert into public.planned_meals
    (meal_plan_id, position, title, summary, total_minutes, servings, ingredients, steps,
     nights, counts_for_groceries)
  select
    plan_id,
    (meals.ordinality - 1)::smallint,
    meals.meal ->> 'title',
    meals.meal ->> 'summary',
    (meals.meal ->> 'total_minutes')::smallint,
    (meals.meal ->> 'servings')::smallint,
    meals.meal -> 'ingredients',
    meals.meal -> 'steps',
    coalesce((meals.meal ->> 'nights')::smallint, 1),
    coalesce((meals.meal ->> 'counts_for_groceries')::boolean, true)
  from jsonb_array_elements(p_meals) with ordinality as meals (meal, ordinality);

  return plan_id;
end;
$$;
