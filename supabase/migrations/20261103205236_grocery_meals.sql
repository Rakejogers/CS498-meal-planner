-- A user's current grocery worksheet. These entries are recipe requirements,
-- not generated meal plans; generation can later use lib/groceries.ts directly.
create table public.grocery_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  recipe_servings smallint not null check (recipe_servings between 1 and 100),
  planned_servings smallint not null check (planned_servings between 1 and 12),
  included boolean not null default true,
  ingredients jsonb not null check (
    case when jsonb_typeof(ingredients) = 'array'
      then jsonb_array_length(ingredients) between 1 and 50
        and octet_length(ingredients::text) <= 32768
      else false
    end
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index grocery_meals_user_created_idx on public.grocery_meals (user_id, created_at, id);

create trigger set_updated_at before update on public.grocery_meals
  for each row execute function public.set_updated_at();

alter table public.grocery_meals enable row level security;

create policy "Users can read their own grocery meals"
  on public.grocery_meals for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own grocery meals"
  on public.grocery_meals for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own grocery meals"
  on public.grocery_meals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own grocery meals"
  on public.grocery_meals for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.grocery_meals from anon, authenticated;
grant select, delete on public.grocery_meals to authenticated;
grant insert (user_id, title, recipe_servings, planned_servings, included, ingredients)
  on public.grocery_meals to authenticated;
grant update (title, recipe_servings, planned_servings, included, ingredients)
  on public.grocery_meals to authenticated;
