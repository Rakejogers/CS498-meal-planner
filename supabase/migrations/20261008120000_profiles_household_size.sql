-- Household size: how many people the user normally cooks for. It is their
-- default serving count, so recipes and grocery quantities are scaled to it.
--
-- Everyone starts at two until they say otherwise. The range matches
-- lib/household.ts.

alter table public.profiles
  add column household_size smallint not null default 2
  check (household_size between 1 and 12);

grant update (household_size) on public.profiles to authenticated;
