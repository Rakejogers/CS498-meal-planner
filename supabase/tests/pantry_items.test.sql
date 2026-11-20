-- Pantry items: row level security and normalized uniqueness.
begin;
select plan(15);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.pantry_items (user_id, name, state)
values ('22222222-2222-2222-2222-222222222222', 'Rice', 'have');

-- Signed out.
set local role anon;

select throws_ok(
  'select * from public.pantry_items',
  '42501',
  null,
  'signed-out users cannot read pantry items'
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
  'select id from public.pantry_items',
  'users cannot see someone else''s pantry items'
);

select lives_ok(
  $$ insert into public.pantry_items (user_id, name)
     values ('11111111-1111-1111-1111-111111111111', ' Olive   oil ') $$,
  'users can add their own pantry items'
);

select is(
  (select state from public.pantry_items where user_id = '11111111-1111-1111-1111-111111111111'),
  'have',
  'new pantry items default to have'
);

select throws_ok(
  $$ insert into public.pantry_items (user_id, name, state)
     values ('11111111-1111-1111-1111-111111111111', 'olive oil', 'low') $$,
  '23505',
  null,
  'the same pantry ingredient cannot be added twice with different spacing or case'
);

select results_eq(
  $$ update public.pantry_items
     set state = 'low'
     where user_id = '11111111-1111-1111-1111-111111111111'
     returning state $$,
  $$ values ('low') $$,
  'users can update their own pantry item state'
);

select throws_ok(
  $$ insert into public.pantry_items (user_id, name, state)
     values ('22222222-2222-2222-2222-222222222222', 'Pasta', 'have') $$,
  '42501',
  null,
  'users cannot add pantry items for someone else'
);

select is_empty(
  $$ update public.pantry_items
     set state = 'out'
     where user_id = '22222222-2222-2222-2222-222222222222' returning id $$,
  'users cannot update someone else''s pantry items'
);

select is_empty(
  $$ delete from public.pantry_items
     where user_id = '22222222-2222-2222-2222-222222222222' returning id $$,
  'users cannot delete someone else''s pantry items'
);

select results_eq(
  $$ insert into public.pantry_items (
       user_id, name, quantity, unit, bought_on, expires_on, opened_on
     )
     values (
       '11111111-1111-1111-1111-111111111111', 'Spinach', 1, 'bunch',
       '2026-11-01', '2026-11-08', '2026-11-02'
     )
     returning unit, bought_on::text, expires_on::text, opened_on::text $$,
  $$ values ('bunch', '2026-11-01', '2026-11-08', '2026-11-02') $$,
  'users can save how much they have and the bought, opened, and expiration dates'
);

select throws_ok(
  $$ insert into public.pantry_items (user_id, name, bought_on, opened_on)
     values ('11111111-1111-1111-1111-111111111111', 'Milk', '2026-11-04', '2026-11-01') $$,
  '23514',
  null,
  'an item cannot be opened before it was bought'
);

select results_eq(
  $$ update public.pantry_items
     set quantity = 0, state = 'out'
     where name = 'Spinach'
     returning quantity::float, state $$,
  $$ values (0::float, 'out') $$,
  'cooking the last of an ingredient can leave none'
);

select results_eq(
  $$ delete from public.pantry_items
     where user_id = '11111111-1111-1111-1111-111111111111' and name = 'Spinach'
     returning name $$,
  $$ values ('Spinach') $$,
  'users can delete one of their own pantry items'
);

select results_eq(
  $$ delete from public.pantry_items
     where user_id = '11111111-1111-1111-1111-111111111111' returning name $$,
  $$ values (' Olive   oil ') $$,
  'users can delete their own pantry items'
);

reset role;

select results_eq(
  $$ select name from public.pantry_items
     where user_id = '22222222-2222-2222-2222-222222222222' $$,
  $$ values ('Rice') $$,
  'other users'' pantry items remain untouched'
);

select * from finish();
rollback;
