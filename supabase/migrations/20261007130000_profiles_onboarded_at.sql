-- Onboarding: new users are sent through first-time setup until this is set.
-- Null means they haven't finished (or skipped) it yet.

alter table public.profiles add column onboarded_at timestamptz;

grant update (onboarded_at) on public.profiles to authenticated;
