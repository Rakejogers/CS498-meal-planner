# Plantry

Meal planner and grocery manager for a household. **Plantry** is the working name.

Plantry plans a week of dinners around what a household likes and what's already in their kitchen, builds one consolidated grocery list, and (eventually) sends it to a Kroger cart. See [docs/project-overview.md](docs/project-overview.md) for the full product brief and [docs/design.md](docs/design.md) for the design guide.

## What's here

This is the foundation everything else builds on:

- Landing page (`/`)
- Sign in with Google, or email + password (`/login`)
- A signed-in dashboard (`/dashboard`) that plans a week of dinners around your household and food preferences
- Tests at every level (unit, component, database, end-to-end) and CI that runs them on every PR

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com); tokens in `app/globals.css` use shadcn/ui names
- [Supabase](https://supabase.com): Postgres, Auth, and Row Level Security, running locally in Docker
- `zod` for validation, `lucide-react` for icons
- Vitest + Testing Library, Playwright, and pgTAP for tests. ESLint + Prettier for code style.



## Getting started

**Prerequisites:**

- Node 24 (`nvm use` picks it up from `.nvmrc`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running
- The [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`brew install supabase/tap/supabase`)

```bash
npm install
npm run db:start                   # starts local Supabase (first run downloads images)
npm run env:local                  # writes .env.local from the running stack
npx playwright install chromium    # once, for end-to-end tests
npm run dev                        # http://localhost:3000
```

Create an account at [http://localhost:3000/login?mode=signup&method=email](http://localhost:3000/login?mode=signup&method=email). Local accounts are confirmed instantly.

**Kroger:** store search and the Kroger login need `KROGER_CLIENT_ID`, `KROGER_CLIENT_SECRET`, and `KROGER_REDIRECT_URI` in `.env.local` (see `.env.example`). Get them from the team's app on [developer.kroger.com](https://developer.kroger.com). The redirect URI must match one registered there exactly. Without them, the rest of the app still works.

**Editor:** VS Code will offer the recommended extensions (ESLint, Prettier, Tailwind, Vitest, Playwright). Format-on-save is already configured in `.vscode/settings.json`.

### Sign in with Google (optional locally)

Email and password works with no setup. Without the steps below, the Google button ends on a Google "invalid client" error, so use "Use email instead". To try the Google button locally:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth client ID (type "Web application") and add `http://127.0.0.1:58321/auth/v1/callback` as an authorized redirect URI.
2. Put its ID and secret in `supabase/.env` (gitignored):

   ```bash
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="GOCSPX-..."
   ```

3. Restart Supabase: `npm run db:stop && npm run db:start`.

For the hosted project, enable Google under Authentication → Sign In / Providers in the Supabase dashboard, use `https://<project-ref>.supabase.co/auth/v1/callback` as the redirect URI in Google Cloud, and add `https://<your-domain>/auth/callback` to the allowed redirect URLs.

### Local services


| Service                    | URL                                                       |
| -------------------------- | --------------------------------------------------------- |
| App                        | [http://localhost:3000](http://localhost:3000)            |
| Supabase Studio (DB admin) | [http://127.0.0.1:58323](http://127.0.0.1:58323)          |
| Mailpit (local emails)     | [http://127.0.0.1:58324](http://127.0.0.1:58324)          |
| Supabase API               | [http://127.0.0.1:58321](http://127.0.0.1:58321)          |
| Postgres                   | `postgresql://postgres:postgres@127.0.0.1:58322/postgres` |


Supabase runs on the 583xx ports instead of the default 543xx, so it can sit alongside other local Supabase projects.

## Scripts


| Script               | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Next.js dev server                                                  |
| `npm run check`      | Lint, format check, typecheck, and unit tests. Run before you push. |
| `npm test`           | Unit and component tests (Vitest)                                   |
| `npm run test:watch` | Same, re-running on save                                            |
| `npm run test:e2e`   | End-to-end tests (Playwright). Needs Supabase running.              |
| `npm run test:db`    | Database tests for RLS policies (pgTAP). Needs Supabase running.    |
| `npm run lint`       | ESLint                                                              |
| `npm run format`     | Prettier (also sorts Tailwind classes)                              |
| `npm run typecheck`  | Generate route types and run `tsc`                                  |
| `npm run build`      | Production build                                                    |
| `npm run db:start`   | Start local Supabase                                                |
| `npm run db:stop`    | Stop local Supabase                                                 |
| `npm run db:reset`   | Rebuild the local DB from migrations + `seed.sql` (wipes data)      |
| `npm run db:types`   | Regenerate `lib/supabase/database.types.ts`                         |
| `npm run env:local`  | Write `.env.local` from the running stack                           |


A pre-commit hook (husky + lint-staged) formats and lints the files you commit.

## Project layout

```
app/
  page.tsx              Landing page
  login/                Sign in / sign up page, form, and server actions
  auth/confirm/         Email-link handler (used when confirmation is on)
  auth/callback/        Where Google sign-in lands
  auth/signout/         Sign out
  api/kroger/           Kroger login: connect (start) and callback (finish)
  (app)/                Signed-in pages; layout.tsx is the app shell
    dashboard/          Where users land after signing in
    settings/           Food preferences, household, and Kroger store/account
components/             Shared UI (components/ui = primitives)
lib/
  auth.ts               Route rules (public routes, APP_HOME, safe redirects)
  data.ts               Data access layer: every server read of user data
  kroger/               Kroger API: stores, products, cart, login tokens
  supabase/             Browser, server, and proxy clients + generated DB types
proxy.ts                Refreshes the session; redirects signed-out users
e2e/                    Playwright tests (+ fixtures.ts for signed-in users)
supabase/
  migrations/           SQL migrations (source of truth for the schema)
  tests/                pgTAP database tests
docs/                   Product brief, design guide, slice 1 reference
```

Unit tests sit next to the code they test (`lib/auth.test.ts`). [CONTRIBUTING.md](CONTRIBUTING.md) covers where new code goes, testing, and the PR workflow.

## Database

Tables live in `public`. Every table has Row Level Security, and a database test fails if one doesn't.

- `profiles`: one per user (display name, household size, dinners per week, Kroger store), created by a trigger on `auth.users` at sign-up
- `food_preferences`: dietary needs, can't-eat, dislikes, and likes
- `meal_plans` and `planned_meals`: a user's week of dinners, with each recipe's ingredients and steps

The **Groceries** page combines the ingredients of the current week's dinners into one list (`lib/groceries.ts`); see [`docs/grocery-list.md`](docs/grocery-list.md).

**Changing the schema:**

```bash
supabase migration new add_households   # creates supabase/migrations/<timestamp>_add_households.sql
# write your SQL (include RLS policies!) and a test in supabase/tests/
npm run db:reset                        # apply it locally
npm run db:types                        # refresh TypeScript types
npm run test:db                         # check the policies
```



## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on pushes to `main`:

1. **Checks:** lint, format, typecheck, unit tests, build
2. **Database + E2E:** starts Supabase, runs the pgTAP tests, builds the app, and runs Playwright. If it fails, the Playwright report is attached to the run.



## Troubleshooting

- `Missing Supabase env vars`: run `npm run db:start`, then `npm run env:local`, then restart `npm run dev`.
- **Signed out after** `db:reset`: expected. The reset deletes all users, so create the account again.
- **E2E tests can't connect**: make sure Supabase is running (`npm run db:start`). Playwright reuses your dev server on port 3000 if it's up, and starts one if it isn't.

