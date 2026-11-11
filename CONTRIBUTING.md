# Contributing

Setup is in the [README](README.md). Product brief: [`docs/project-overview.md`](docs/project-overview.md). Design guide: [`docs/design.md`](docs/design.md).

## Workflow

1. Branch off `main` (`feature/…`, `fix/…`, `chore/…`). One feature or fix per PR.
2. Before pushing: `npm run check`. For UI or auth changes, also `npm run test:e2e` (needs `npm run db:start`).
3. Open a PR, wait for CI, squash-merge. A pre-commit hook handles formatting.

## Where code goes

| Adding…                             | Put it in                                                        |
| ----------------------------------- | ---------------------------------------------------------------- |
| Signed-in page                      | `app/(app)/<name>/page.tsx`                                      |
| Public page                         | `app/<name>/page.tsx` **and** add it to `PUBLIC_ROUTES` (`lib/auth.ts`) |
| Component used by one route         | Next to the route                                                |
| Shared component                    | `components/` (primitives in `components/ui/`)                   |
| Form submissions and writes         | Server actions in `app/<route>/actions.ts`                       |
| Server reads of user data           | `lib/data.ts`                                                    |
| Business logic (plan rules, grocery math) | Pure functions in `lib/<area>.ts`, no Supabase or React    |
| External services (Kroger, AI)      | `lib/<service>/`, starting with `import "server-only"`           |
| Schema change                       | New file in `supabase/migrations/` + pgTAP test in `supabase/tests/` |

## Rules

- **Private by default.** `proxy.ts` redirects signed-out users, but it isn't a security boundary. Data reads still go through `lib/data.ts`, which re-checks the user.
- **Server actions:** validate input with zod, take the user from the session (never the form), return `{ error }` for fixable problems, `redirect`/`revalidatePath` on success. Model: `app/login/actions.ts`.
- **Secrets stay server-side.** Only `NEXT_PUBLIC_*` reaches the browser. Add every new env var to `.env.example`.
- **AI for judgment, code for facts.** The model suggests meals; quantities and grocery totals are unit-tested functions. Validate model output with zod.
- **Food-first copy:** "Plan my week", not "Generate with AI". Use tokens from `app/globals.css`.

## Database changes

1. `supabase migration new <name>`. Never edit a migration already on `main`. CI rejects edited migrations and new ones older than `main`'s newest; if `main` moved past yours, recreate it with a new timestamp.
2. Every table gets RLS, policies, and explicit grants (template: `supabase/migrations/*_profiles.sql`). CI fails on tables without RLS.
3. Add a pgTAP test that a user can reach their own rows and no one else's (see `supabase/tests/profiles.test.sql`).
4. Run `npm run db:reset && npm run db:types && npm run test:db` and commit the regenerated `lib/supabase/database.types.ts`. CI fails if it's stale.
5. After merge, CI applies new migrations to production once tests pass on `main`. Don't change the production schema by hand (dashboard or SQL editor); it will drift from the migrations.
6. Write migrations the live app can survive. The old code keeps running for a few minutes after the migration lands, and a Vercel rollback reverts code but not the database. Add columns as nullable or with a default. To rename or drop something, first merge code that stops using it, then drop it in a later PR.

## Releases

Merging to `main` releases in this order:

1. CI runs lint, unit, build, and end-to-end checks on `main`. Database tests and generated-type verification run when `supabase/`, the generated types, dependencies, or CI tooling change. Browser tests still start local Supabase on every run.
2. The `Deploy migrations to production` job requires both test jobs to pass. It compares migrations and deployment configuration/tooling against a successful ancestor CI run whose database deployment job passed. If they match, it reports success without installing the Supabase CLI or connecting to production. Otherwise it runs `supabase db push`, which applies pending migrations and never seeds production. Missing or unreadable deployment history also triggers a normal push, so a failed earlier migration cannot be bypassed by an app-only merge.
3. Vercel builds in parallel but holds the deployment until that job passes (Deployment Checks), then puts it live.

If any step fails, the previous version stays live. Fix it with a new PR; don't use Vercel's "Force Promote" unless the failure has nothing to do with the database.

Keep the workflow triggers and the `Deploy migrations to production` check name intact: Vercel needs a result for every main push. Only database steps are conditional. Failed or skipped prerequisite jobs make the deployment check fail explicitly.

## Testing

Write a test only when it guards something that can genuinely break: branching, security boundaries (open redirects, RLS, auth), parsing, quantity/grocery math, retries, or a bug we've already hit. Don't test markup, copy, or library behavior (zod, Supabase, React), and don't repeat what another layer proves. No coverage targets. Delete tests that don't meet this bar. Bug fixes get a test that failed before the fix.

Use the cheapest test that would catch the bug:

| What                              | Tool                                    | Example                        |
| --------------------------------- | --------------------------------------- | ------------------------------ |
| Pure logic                        | Vitest, `*.test.ts` next to the file    | `lib/auth.test.ts`             |
| Client components with behavior   | Vitest + Testing Library                | `app/login/auth-form.test.tsx` |
| Server actions, route handlers    | Vitest, mock Supabase and `next/navigation` | `app/login/actions.test.ts` |
| Async Server Components, full flows | Playwright in `e2e/`                  | `e2e/auth.spec.ts`             |
| RLS policies and triggers         | pgTAP in `supabase/tests/`              | `supabase/tests/profiles.test.sql` |

- Vitest can't render async Server Components; use Playwright.
- In Playwright, import `test` from `./fixtures` for a signed-in `user` fixture. Query by role/label, not CSS classes.
- Playwright starts the app with `PLAN_GENERATOR=fake`, so tests never call the real model. If it reuses your running `npm run dev` server, meal planning tests call the real model and use your `AI_GATEWAY_API_KEY`. Stop the server first to avoid that.
- Vitest only finds tests in `app/`, `components/`, `lib/`, `scripts/`; Playwright only in `e2e/`. Update the config when adding a source directory.
