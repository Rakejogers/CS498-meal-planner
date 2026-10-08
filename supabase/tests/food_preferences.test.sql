-- Food preferences: row level security.
begin;
select plan(7);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.food_preferences (user_id, dislikes)
values ('22222222-2222-2222-2222-222222222222', '{olives}');

-- Signed out.
set local role anon;

select throws_ok(
  'select * from public.food_preferences',
  '42501',
  null,
  'signed-out users cannot read food preferences'
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
  'select user_id from public.food_preferences',
  'users cannot see someone else''s food preferences'
);

select lives_ok(
  $$ insert into public.food_preferences (user_id, likes)
     values ('11111111-1111-1111-1111-111111111111', '{salmon}') $$,
  'users can save their own food preferences'
);

-- The app's save: an upsert that rewrites every list.
select results_eq(
  $$ insert into public.food_preferences (user_id, dietary_restrictions, cannot_eat, dislikes, likes)
     values ('11111111-1111-1111-1111-111111111111', '{vegetarian}', '{peanuts}', '{olives}', '{}')
     on conflict (user_id) do update set
       user_id = excluded.user_id,
       dietary_restrictions = excluded.dietary_restrictions,
       cannot_eat = excluded.cannot_eat,
       dislikes = excluded.dislikes,
       likes = excluded.likes
     returning cannot_eat, likes $$,
  $$ values ('{peanuts}'::text[], '{}'::text[]) $$,
  'saving again replaces the earlier lists'
);

select throws_ok(
  $$ insert into public.food_preferences (user_id)
     values ('33333333-3333-3333-3333-333333333333') $$,
  '42501',
  null,
  'users cannot save food preferences for someone else'
);

select is_empty(
  $$ update public.food_preferences set likes = '{olives}'
     where user_id = '22222222-2222-2222-2222-222222222222' returning user_id $$,
  'users cannot edit someone else''s food preferences'
);

select throws_ok(
  $$ update public.food_preferences set user_id = '22222222-2222-2222-2222-222222222222' $$,
  null,
  null,
  'users cannot hand their food preferences to someone else'
);

select * from finish();
rollback;
