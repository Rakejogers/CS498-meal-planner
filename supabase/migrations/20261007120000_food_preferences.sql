-- Food preferences: what each user likes, dislikes, and can't eat. The meal
-- planner reads these so suggestions fit the person.
--
-- One row per user, created the first time they save. Food names are stored
-- lowercase and trimmed by the app (see lib/preferences.ts).

create table public.food_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  dietary_restrictions text[] not null default '{}' check (cardinality(dietary_restrictions) <= 30),
  cannot_eat text[] not null default '{}' check (cardinality(cannot_eat) <= 30),
  dislikes text[] not null default '{}' check (cardinality(dislikes) <= 30),
  likes text[] not null default '{}' check (cardinality(likes) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.food_preferences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.food_preferences enable row level security;

create policy "Users can read their own food preferences"
  on public.food_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save their own food preferences"
  on public.food_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own food preferences"
  on public.food_preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- The app saves with an upsert, which needs insert and update on every column
-- it sends (including user_id, which the policies pin to the signed-in user).
revoke all on public.food_preferences from anon, authenticated;
grant select on public.food_preferences to authenticated;
grant insert (user_id, dietary_restrictions, cannot_eat, dislikes, likes)
  on public.food_preferences to authenticated;
grant update (user_id, dietary_restrictions, cannot_eat, dislikes, likes)
  on public.food_preferences to authenticated;
