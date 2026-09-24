# Plenly

Meal planner and grocery manager for a household. **Plenly** is the working name.

Plenly plans a week of dinners around what a household likes and what's already in their kitchen, builds one consolidated grocery list, and (eventually) sends it to a Kroger cart. See [docs/project-overview.md](docs/project-overview.md) for the full product brief.

## What's built so far

**Slice 1: landing → account → onboarding → dashboard**

- Marketing landing page (`/`)
- Email + password sign up / sign in (`/login`)
- Four-step onboarding (`/onboarding`): household size, dinners per week, cuisines, dietary needs, foods to skip, cooking time, confidence, leftovers, budget, kitchen staples, and ingredients to use soon. Re-opening it later edits your saved answers.
- Dashboard (`/dashboard`) summarizing the week, household, kitchen, and next steps

Meal planning, the pantry tools, groceries, and Kroger are next.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com); tokens in `app/globals.css` use shadcn/ui names
- [Supabase](https://supabase.com): Postgres, Auth, Row Level Security, running locally in Docker
- `zod` for validation, `lucide-react` for icons

## Getting started

**Prerequisites:** Node 20+, [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running), and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`brew install supabase/tap/supabase`).

```bash
npm install
npm run db:start    # starts local Supabase (first run downloads images)
npm run env:local   # writes .env.local from the running stack
npm run dev         # http://localhost:3000
```

Create an account at http://localhost:3000/login?mode=signup. Local accounts are confirmed instantly.

### Local services

| Service                    | URL                                                     |
| -------------------------- | ------------------------------------------------------- |
| App                        | http://localhost:3000                                   |
| Supabase Studio (DB admin) | http://127.0.0.1:58323                                  |
| Mailpit (local emails)     | http://127.0.0.1:58324                                  |
| Supabase API               | http://127.0.0.1:58321                                  |
| Postgres                   | `postgresql://postgres:postgres@127.0.0.1:58322/postgres` |

Supabase runs on the 583xx ports instead of the default 543xx, so it can sit alongside other local Supabase projects.

## Scripts

| Script              | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Next.js dev server                                      |
| `npm run build`     | Production build                                        |
| `npm run lint`      | ESLint                                                  |
| `npm run typecheck` | Generate route types and run `tsc`                      |
| `npm run db:start`  | Start local Supabase                                    |
| `npm run db:stop`   | Stop local Supabase                                     |
| `npm run db:reset`  | Rebuild the local DB from migrations + `seed.sql` (wipes data) |
| `npm run db:types`  | Regenerate `lib/supabase/database.types.ts`             |
| `npm run env:local` | Write `.env.local` from the running stack               |

## Project layout

```
app/
  page.tsx              Landing page
  login/                Sign in / sign up page + server actions
  auth/confirm/         Email-link handler (used when confirmation is on)
  auth/signout/         Sign out
  onboarding/           Four-step setup flow + save action
  dashboard/            App shell + overview
components/             Shared UI (components/ui = primitives)
lib/
  data.ts               Server-side data loaders (current user, household)
  onboarding.ts         Onboarding options + zod schema (shared client/server)
  supabase/             Browser, server, and proxy clients + generated DB types
proxy.ts                Refreshes the session; redirects signed-out users
supabase/
  config.toml           Local Supabase config
  migrations/           SQL migrations (source of truth for the schema)
```

## Database

Tables live in `public`, and every table has Row Level Security.

- `profiles`: one per user (display name, onboarding timestamp)
- `households`: one per user for now (size, dinners per week)
- `household_preferences`: cuisines, restrictions, dislikes, time, confidence, leftovers, budget
- `pantry_items`: approximate pantry (`have` / `low` / `out` / `unsure`), staples, use-soon flags

A trigger on `auth.users` creates the profile, household, and default preferences at sign-up.

**Changing the schema:**

```bash
supabase migration new add_meal_plans   # creates supabase/migrations/<timestamp>_add_meal_plans.sql
# write your SQL (include RLS policies!)
npm run db:reset                        # apply it locally
npm run db:types                        # refresh TypeScript types
```

## Troubleshooting

- **`Missing Supabase env vars`**: run `npm run db:start`, then `npm run env:local`, then restart `npm run dev`.
- **`JWT issued at future`**: the Docker VM clock drifted, which usually happens after the laptop sleeps. Reload the page. If it keeps happening, restart Docker Desktop.
- **Signed out after `db:reset`**: expected. The reset deletes all users, so create the account again.
