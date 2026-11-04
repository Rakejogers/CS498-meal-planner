-- Meal plans: a week of dinners for one user. A plan is one row per user per
-- week; its dinners are rows in planned_meals.
--
-- Meals keep the full recipe (ingredients and steps) so recipe pages and the
-- grocery list can read them without asking the model again. Ingredients are
-- `[{ name, quantity, unit }]` with numeric quantities, and steps are an array
-- of strings; lib/meal-plan.ts validates both before anything is saved.

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Weeks start on Monday (see upcomingWeekStart in lib/meal-plan.ts).
  week_start date not null check (extract(isodow from week_start) = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create trigger set_updated_at before update on public.meal_plans
  for each row execute function public.set_updated_at();

create table public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  -- Order on the page. A week has at most seven dinners.
  position smallint not null check (position between 0 and 6),
  title text not null check (char_length(title) between 1 and 80),
  summary text not null default '' check (char_length(summary) <= 240),
  total_minutes smallint not null check (total_minutes between 5 and 240),
  -- Same range as household size, which is the default.
  servings smallint not null check (servings between 1 and 12),
  ingredients jsonb not null
    check (jsonb_typeof(ingredients) = 'array' and jsonb_array_length(ingredients) between 1 and 30),
  steps jsonb not null
    check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (meal_plan_id, position)
);

create trigger set_updated_at before update on public.planned_meals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.meal_plans enable row level security;
alter table public.planned_meals enable row level security;

create policy "Users can read their own meal plans"
  on public.meal_plans for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own meal plans"
  on public.meal_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own meal plans"
  on public.meal_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Planned meals have no user_id: they belong to whoever owns their plan.
create policy "Users can read meals in their own plans"
  on public.planned_meals for select to authenticated
  using (exists (
    select 1 from public.meal_plans
    where id = meal_plan_id and user_id = (select auth.uid())
  ));

create policy "Users can add meals to their own plans"
  on public.planned_meals for insert to authenticated
  with check (exists (
    select 1 from public.meal_plans
    where id = meal_plan_id and user_id = (select auth.uid())
  ));

create policy "Users can change meals in their own plans"
  on public.planned_meals for update to authenticated
  using (exists (
    select 1 from public.meal_plans
    where id = meal_plan_id and user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.meal_plans
    where id = meal_plan_id and user_id = (select auth.uid())
  ));

create policy "Users can remove meals from their own plans"
  on public.planned_meals for delete to authenticated
  using (exists (
    select 1 from public.meal_plans
    where id = meal_plan_id and user_id = (select auth.uid())
  ));

-- A plan's week never changes; planning the week again replaces its meals or
-- deletes the plan. Meals can be edited in place (swapping a meal, changing
-- servings) but never moved to another plan or slot.
revoke all on public.meal_plans from anon, authenticated;
grant select, delete on public.meal_plans to authenticated;
grant insert (user_id, week_start) on public.meal_plans to authenticated;

revoke all on public.planned_meals from anon, authenticated;
grant select, delete on public.planned_meals to authenticated;
grant insert (meal_plan_id, position, title, summary, total_minutes, servings, ingredients, steps)
  on public.planned_meals to authenticated;
grant update (title, summary, total_minutes, servings, ingredients, steps)
  on public.planned_meals to authenticated;

-- ---------------------------------------------------------------------------
-- Saving a plan
-- ---------------------------------------------------------------------------

-- Replaces the signed-in user's plan for a week in one transaction, so a bad
-- meal can't leave them with half a plan or lose the one they had. Runs as the
-- caller, so the policies and grants above still apply. `p_meals` is an array
-- of objects with the planned_meals column names; its order sets `position`.
create function public.save_meal_plan(p_week_start date, p_meals jsonb)
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
    (meal_plan_id, position, title, summary, total_minutes, servings, ingredients, steps)
  select
    plan_id,
    (meals.ordinality - 1)::smallint,
    meals.meal ->> 'title',
    meals.meal ->> 'summary',
    (meals.meal ->> 'total_minutes')::smallint,
    (meals.meal ->> 'servings')::smallint,
    meals.meal -> 'ingredients',
    meals.meal -> 'steps'
  from jsonb_array_elements(p_meals) with ordinality as meals (meal, ordinality);

  return plan_id;
end;
$$;

revoke all on function public.save_meal_plan(date, jsonb) from public, anon, authenticated;
grant execute on function public.save_meal_plan(date, jsonb) to authenticated;
