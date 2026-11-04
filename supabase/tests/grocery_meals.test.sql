begin;
select plan(12);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.grocery_meals (id, user_id, title, recipe_servings, planned_servings, ingredients)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Pasta', 2, 4, '[{"name":"pasta","quantity":200,"unit":"g"}]'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Soup', 2, 2, '[{"name":"carrot","quantity":2,"unit":"each"}]');

set local role anon;
select throws_ok('select * from public.grocery_meals', '42501', null, 'signed-out users cannot read grocery meals');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select results_eq('select title from public.grocery_meals', $$ values ('Pasta'::text) $$, 'users only see their own meals');
select lives_ok(
  $$ insert into public.grocery_meals (user_id, title, recipe_servings, planned_servings, ingredients)
     values ('11111111-1111-1111-1111-111111111111', 'Salad', 2, 2, '[{"name":"lettuce","quantity":1,"unit":"each"}]') $$,
  'users can save their own meal'
);
select throws_ok(
  $$ insert into public.grocery_meals (user_id, title, recipe_servings, planned_servings, ingredients)
     values ('22222222-2222-2222-2222-222222222222', 'Intruder', 2, 2, '[{}]') $$,
  '42501', null, 'users cannot insert a meal for someone else'
);
select results_eq(
  $$ update public.grocery_meals set planned_servings = 6 where title = 'Pasta' returning planned_servings $$,
  $$ values (6::smallint) $$, 'users can scale their own meal'
);
select is_empty(
  $$ update public.grocery_meals set title = 'Intruder' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning id $$,
  'users cannot edit someone else''s meal'
);
select is_empty(
  $$ delete from public.grocery_meals where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' returning id $$,
  'users cannot delete someone else''s meal'
);
select throws_ok(
  $$ update public.grocery_meals set user_id = '22222222-2222-2222-2222-222222222222' where title = 'Pasta' $$,
  '42501', null, 'ownership cannot be transferred'
);
select throws_ok(
  $$ update public.grocery_meals set created_at = now() $$,
  '42501', null, 'creation metadata cannot be changed'
);
select throws_ok(
  $$ update public.grocery_meals set recipe_servings = 0 where title = 'Pasta' $$,
  '23514', null, 'zero recipe servings cannot cause division by zero'
);
select throws_ok(
  $$ update public.grocery_meals set ingredients = '[]' where title = 'Pasta' $$,
  '23514', null, 'a saved meal must have ingredients'
);
select results_eq(
  $$ delete from public.grocery_meals where title = 'Pasta' returning title $$,
  $$ values ('Pasta'::text) $$, 'users can remove their own meal'
);

select * from finish();
rollback;
