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

1. `supabase migration new <name>`. Never edit a migration already on `main`.
2. Every table gets RLS, policies, and explicit grants (template: `supabase/migrations/*_profiles.sql`). CI fails on tables without RLS.
3. Add a pgTAP test that a user can reach their own rows and no one else's (see `supabase/tests/profiles.test.sql`).
4. Run `npm run db:reset && npm run db:types && npm run test:db` and commit the regenerated `lib/supabase/database.types.ts`. CI fails if it's stale.

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
- Vitest only finds tests in `app/`, `components/`, `lib/`, `scripts/`; Playwright only in `e2e/`. Update the config when adding a source directory.
