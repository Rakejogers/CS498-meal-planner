-- Meal plans and planned meals: row level security and week rules.
begin;
select plan(19);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

-- Bob already has a plan with one dinner.
insert into public.meal_plans (id, user_id, week_start)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '2026-11-02');

insert into public.planned_meals (meal_plan_id, position, title, total_minutes, servings, ingredients, steps)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0, 'Bean chili', 40, 2,
  '[{"name": "black beans", "quantity": 2, "unit": "can"}]', '["Simmer everything."]'
);

-- Signed out.
set local role anon;

select throws_ok(
  'select * from public.meal_plans',
  '42501',
  null,
  'signed-out users cannot read meal plans'
);

-- Signed in as Alice.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}',
  true
);

select is_empty(
  'select id from public.meal_plans',
  'users cannot see someone else''s meal plans'
);

select is_empty(
  'select id from public.planned_meals',
  'users cannot see the meals in someone else''s plan'
);

select lives_ok(
  $$ insert into public.meal_plans (user_id, week_start)
     values ('11111111-1111-1111-1111-111111111111', '2026-11-02') $$,
  'users can start a plan for a week'
);

select throws_ok(
  $$ insert into public.meal_plans (user_id, week_start)
     values ('11111111-1111-1111-1111-111111111111', '2026-11-02') $$,
  '23505',
  null,
  'users have one plan per week'
);

select throws_ok(
  $$ insert into public.meal_plans (user_id, week_start)
     values ('11111111-1111-1111-1111-111111111111', '2026-11-03') $$,
  '23514',
  null,
  'a plan''s week starts on a Monday'
);

select throws_ok(
  $$ insert into public.meal_plans (user_id, week_start)
     values ('22222222-2222-2222-2222-222222222222', '2026-11-09') $$,
  '42501',
  null,
  'users cannot create plans for someone else'
);

select results_eq(
  $$ insert into public.planned_meals (meal_plan_id, position, title, total_minutes, servings, ingredients, steps)
     values (
       (select id from public.meal_plans), 0, 'Salmon rice bowls', 25, 2,
       '[{"name": "salmon", "quantity": 300, "unit": "g"}]', '["Cook the rice.", "Sear the salmon."]'
     )
     returning title $$,
  $$ values ('Salmon rice bowls') $$,
  'users can add meals to their own plan'
);

select throws_ok(
  $$ insert into public.planned_meals (meal_plan_id, position, title, total_minutes, servings, ingredients, steps)
     values (
       'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 'Sneaky soup', 20, 2,
       '[{"name": "water", "quantity": 1, "unit": "l"}]', '["Boil."]'
     ) $$,
  '42501',
  null,
  'users cannot add meals to someone else''s plan'
);

select is_empty(
  $$ update public.planned_meals set title = 'Mallory''s chili'
     where meal_plan_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning id $$,
  'users cannot change meals in someone else''s plan'
);

select is_empty(
  $$ delete from public.meal_plans
     where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning id $$,
  'users cannot delete someone else''s plan'
);

select throws_ok(
  $$ update public.planned_meals set meal_plan_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  '42501',
  null,
  'users cannot move a meal into someone else''s plan'
);

-- Saving through save_meal_plan, still as Alice. She and Bob both have a plan
-- for this week.
select lives_ok(
  $$ select public.save_meal_plan('2026-11-02', '[
       {"title": "Tacos", "summary": "", "total_minutes": 30, "servings": 2,
        "ingredients": [{"name": "tortillas", "quantity": 6, "unit": "each"}], "steps": ["Warm."]},
       {"title": "Curry", "summary": "", "total_minutes": 40, "servings": 2,
        "ingredients": [{"name": "chickpeas", "quantity": 1, "unit": "can"}], "steps": ["Simmer."]}
     ]') $$,
  'users can save a plan for a week'
);

select results_eq(
  'select position, title from public.planned_meals order by position',
  $$ values (0::smallint, 'Tacos'), (1::smallint, 'Curry') $$,
  'saving a week replaces its earlier meals, in the order given'
);

select throws_ok(
  $$ select public.save_meal_plan('2026-11-02', '[
       {"title": "Soup", "summary": "", "total_minutes": 20, "servings": 2,
        "ingredients": [{"name": "water", "quantity": 1, "unit": "l"}], "steps": ["Boil."]},
       {"title": "Too quick", "summary": "", "total_minutes": 1, "servings": 2,
        "ingredients": [{"name": "water", "quantity": 1, "unit": "l"}], "steps": ["Boil."]}
     ]') $$,
  '23514',
  null,
  'a bad meal fails the whole save'
);

select results_eq(
  'select title from public.planned_meals order by position',
  $$ values ('Tacos'), ('Curry') $$,
  'a failed save keeps the plan that was there'
);

select throws_ok(
  $$ select public.save_meal_plan('2026-11-02', '[]') $$,
  '22023',
  null,
  'a plan needs at least one meal'
);

reset role;

select results_eq(
  $$ select title from public.planned_meals
     where meal_plan_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' $$,
  $$ values ('Bean chili') $$,
  'saving a week leaves other users'' plans alone'
);

set local role anon;

select throws_ok(
  $$ select public.save_meal_plan('2026-11-02', '[]') $$,
  '42501',
  null,
  'signed-out users cannot save a plan'
);

select * from finish();
rollback;
