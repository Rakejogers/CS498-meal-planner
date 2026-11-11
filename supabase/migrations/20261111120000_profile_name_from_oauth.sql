-- Google sign-ups don't send our `display_name`; they send the account's full
-- name as `full_name` (and `name`). Fall back to its first word so the app can
-- still greet them by first name. No new table, so RLS is unchanged.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(left(btrim(meta ->> 'display_name'), 60), ''),
      nullif(left(split_part(btrim(coalesce(meta ->> 'full_name', meta ->> 'name')), ' ', 1), 60), '')
    )
  );
  return new;
end;
$$;
