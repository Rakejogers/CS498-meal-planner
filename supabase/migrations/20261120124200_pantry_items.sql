-- Pantry items: a lightweight record of ingredients the user already has.
-- Story 6 reads items marked "have" during planning and on recipe pages.

create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  state text not null default 'have' check (state in ('have', 'low', 'out', 'unsure')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index pantry_items_user_name_key
  on public.pantry_items (
    user_id,
    lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))
  );

create trigger set_updated_at before update on public.pantry_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.pantry_items enable row level security;

create policy "Users can read their own pantry items"
  on public.pantry_items for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own pantry items"
  on public.pantry_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can change their own pantry items"
  on public.pantry_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own pantry items"
  on public.pantry_items for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.pantry_items from anon, authenticated;
grant select, delete on public.pantry_items to authenticated;
grant insert (user_id, name, state) on public.pantry_items to authenticated;
grant update (name, state) on public.pantry_items to authenticated;
