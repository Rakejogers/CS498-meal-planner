-- Plenly: initial schema
--
-- Every user gets one household. Preferences, pantry items, and (later) meal
-- plans belong to the household rather than the user, so shared households can
-- be added without reshaping data.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.cooking_confidence as enum ('beginner', 'comfortable', 'confident');
create type public.leftover_preference as enum ('love', 'sometimes', 'avoid');
create type public.budget_preference as enum ('thrifty', 'balanced', 'flexible');
create type public.pantry_state as enum ('have', 'low', 'out', 'unsure');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  size smallint not null default 2 check (size between 1 and 12),
  dinners_per_week smallint not null default 4 check (dinners_per_week between 1 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_preferences (
  household_id uuid primary key references public.households (id) on delete cascade,
  cuisines text[] not null default '{}',
  dietary_restrictions text[] not null default '{}',
  dislikes text[] not null default '{}',
  max_cook_minutes smallint not null default 30 check (max_cook_minutes between 10 and 180),
  cooking_confidence public.cooking_confidence not null default 'comfortable',
  leftovers public.leftover_preference not null default 'sometimes',
  budget public.budget_preference not null default 'balanced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pantry state is deliberately approximate (have / low / out / unsure).
-- Names are stored normalized so "Garlic " and "garlic" are the same item.
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null check (name = lower(btrim(name)) and char_length(name) between 1 and 80),
  state public.pantry_state not null default 'have',
  is_staple boolean not null default false,
  use_soon boolean not null default false,
  quantity_note text check (char_length(quantity_note) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, name)
);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.households
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.household_preferences
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.pantry_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New users get a profile, a household, and default preferences
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_household_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 60), ''));

  insert into public.households (owner_id)
  values (new.id)
  returning id into new_household_id;

  insert into public.household_preferences (household_id)
  values (new_household_id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_preferences enable row level security;
alter table public.pantry_items enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Owners can read their household"
  on public.households for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Owners can update their household"
  on public.households for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can read household preferences"
  on public.household_preferences for select to authenticated
  using (household_id in (select id from public.households where owner_id = (select auth.uid())));

create policy "Owners can update household preferences"
  on public.household_preferences for update to authenticated
  using (household_id in (select id from public.households where owner_id = (select auth.uid())))
  with check (household_id in (select id from public.households where owner_id = (select auth.uid())));

create policy "Owners can read pantry items"
  on public.pantry_items for select to authenticated
  using (household_id in (select id from public.households where owner_id = (select auth.uid())));

create policy "Owners can add pantry items"
  on public.pantry_items for insert to authenticated
  with check (household_id in (select id from public.households where owner_id = (select auth.uid())));

create policy "Owners can update pantry items"
  on public.pantry_items for update to authenticated
  using (household_id in (select id from public.households where owner_id = (select auth.uid())))
  with check (household_id in (select id from public.households where owner_id = (select auth.uid())));

create policy "Owners can delete pantry items"
  on public.pantry_items for delete to authenticated
  using (household_id in (select id from public.households where owner_id = (select auth.uid())));

-- Profiles, households, and preferences are created by the signup trigger, so
-- clients only ever read and update them.
revoke all on public.profiles, public.households, public.household_preferences, public.pantry_items
  from anon, authenticated;
grant select, update on public.profiles, public.households, public.household_preferences
  to authenticated;
grant select, insert, update, delete on public.pantry_items to authenticated;
