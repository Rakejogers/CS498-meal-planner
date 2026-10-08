-- Profiles: sign-up trigger and row level security.
begin;
select plan(9);

-- Signing up (inserting into auth.users) creates a profile.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', '{"display_name": " Alice "}'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', '{"display_name": "   "}');

select is(
  (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Alice',
  'sign-up creates a profile with the trimmed display name'
);

select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  null,
  'a blank display name is stored as null'
);

-- Signed out.
set local role anon;

select throws_ok(
  'select * from public.profiles',
  '42501',
  null,
  'signed-out users cannot read profiles'
);

-- Signed in as Alice.
reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}',
  true
);

select results_eq(
  'select id from public.profiles',
  $$ values ('11111111-1111-1111-1111-111111111111'::uuid) $$,
  'users only see their own profile'
);

select results_eq(
  $$ update public.profiles set display_name = 'Al' returning display_name $$,
  $$ values ('Al') $$,
  'users can rename themselves'
);

select lives_ok(
  $$ update public.profiles set onboarded_at = now() $$,
  'users can finish onboarding'
);

select is_empty(
  $$ update public.profiles set display_name = 'Mallory'
     where id = '22222222-2222-2222-2222-222222222222' returning id $$,
  'users cannot edit someone else''s profile'
);

select throws_ok(
  $$ update public.profiles set created_at = now() $$,
  '42501',
  null,
  'users cannot edit columns the app doesn''t let them change'
);

select throws_ok(
  $$ insert into public.profiles (id) values ('33333333-3333-3333-3333-333333333333') $$,
  '42501',
  null,
  'users cannot create profiles directly'
);

select * from finish();
rollback;
