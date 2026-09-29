# Contributing

How we work on Plantry, so features like onboarding, meal generation, and Kroger slot in cleanly. Setup is in the [README](README.md).

## Workflow

1. Branch off `main`: `git switch -c feature/short-name` (or `fix/…`, `chore/…`).
2. Keep PRs small, one feature or fix each. Draft PRs are fine for early feedback.
3. Run `npm run check` before pushing. For UI or auth changes, run `npm run test:e2e` too.
4. Open a PR. CI must pass before merging. Squash-merge into `main`.

A pre-commit hook formats and lints staged files automatically, so formatting never comes up in review.

## Where code goes

| You're adding…                            | Put it in                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| A signed-in page                          | `app/(app)/<name>/page.tsx`. It gets the app shell and auth.              |
| A public page                             | `app/<name>/page.tsx`, **and** add it to `PUBLIC_ROUTES` in `lib/auth.ts` |
| Components used by one route              | Next to the route, e.g. `app/(app)/plan/meal-card.tsx`                    |
| Components shared across routes           | `components/`. Primitives (buttons, inputs) go in `components/ui/`.       |
| Form submissions and writes               | Server actions in `app/<route>/actions.ts`                                |
| Server reads of user data                 | `lib/data.ts` (split into `lib/data/<area>.ts` once it grows)             |
| Business logic (plan rules, grocery math) | Pure functions in `lib/<area>.ts`, with no Supabase or React inside       |
| External services (Kroger, AI model)      | `lib/<service>/`, starting with `import "server-only"`                    |
| Schema changes                            | A new file in `supabase/migrations/` plus a test in `supabase/tests/`     |

A few rules that keep this safe and testable:

- **Every route is private unless listed.** `proxy.ts` sends signed-out visitors to `/login` for anything not in `PUBLIC_ROUTES`. Pages still load data through `lib/data.ts`, which checks the user again. The proxy alone isn't a security boundary.
- **Validate every server action with zod.** Treat action input like a public API request. Get the user from the session, never from the form. Return `{ error }` for problems the user can fix, then `redirect` or `revalidatePath` on success. `app/login/actions.ts` is the model.
- **Keep secrets server-side.** Only `NEXT_PUBLIC_*` variables reach the browser. API keys for Kroger or the AI model must not have that prefix and must only be imported from `server-only` modules. Add every new variable to `.env.example` with a comment.
- **AI for judgment, code for facts.** (See the product brief.) The model suggests meals. Quantities, pantry math, and grocery totals are plain functions we can unit test. Validate model output with zod before using it.
- **Food-first UI copy.** Say "Plan my week", not "Generate with AI". Use the tokens in `app/globals.css` and the patterns in `docs/design.md`.

## Database changes

```bash
supabase migration new add_households
```

- Never edit a migration that's already on `main`. Add a new one instead.
- Every table needs `enable row level security`, policies, and explicit grants. `supabase/migrations/*_profiles.sql` is the template. `supabase/tests/rls_enabled.test.sql` fails CI if a table ships without RLS.
- Write a pgTAP test showing that a user can reach their own rows and not anyone else's. `supabase/tests/profiles.test.sql` shows how.
- Afterwards run `npm run db:reset && npm run db:types && npm run test:db`, and commit the regenerated `lib/supabase/database.types.ts`.

## Testing

`npm run check` covers source code, project configuration, and test code. Markdown and `docs/` are excluded from formatting checks and pre-commit formatting. Static assets in `public/`, local agent/editor metadata, dependency folders, generated files, build output, caches, and test reports are excluded from the checks that do not need them. The ignore lists live in `.prettierignore`, `eslint.config.mjs`, and `tsconfig.json`.

Vitest discovers `*.test.ts` and `*.test.tsx` only in `app/`, `components/`, `lib/`, and `scripts/`. Playwright discovers browser tests only in `e2e/`; database tests stay in `supabase/tests/` and run with `npm run test:db`. TypeScript still checks imported database types and Next.js-generated route types because application correctness depends on them. Keep these scopes up to date when introducing another source directory.

### What deserves a test

A test is worth having when it guards something that can genuinely break and would hurt if it did. That means branching logic, security boundaries (open redirects, RLS, auth), input parsing, quantity and grocery math, retries and timing, and any bug we've already hit. It also means integration points a mock can't prove, like the real error codes Supabase returns.

Leave these untested:

- Markup and copy: "the heading says X", "the link points to /login", "the toggle toggles".
- Library behavior: zod validating an email, Supabase signing a user in, React holding state.
- Anything another layer already proves. If an e2e test drives a flow against real Supabase, don't also write a mocked unit test of the same flow.

We don't chase a coverage number. A test added only to have a test is noise: it slows CI, breaks when copy changes, and hides the tests that matter. When you touch a test that doesn't meet this bar, delete it.

Pick the cheapest test that would catch the bug:

| What                                | Tool                                              | Example                            |
| ----------------------------------- | ------------------------------------------------- | ---------------------------------- |
| Pure logic                          | Vitest, `*.test.ts` next to the file              | `lib/auth.test.ts`                 |
| Code that calls `fetch` or timers   | Vitest with `vi.stubGlobal` / fake timers         | `lib/supabase/fetch.test.ts`       |
| Client components with behavior     | Vitest + Testing Library                          | `app/login/auth-form.test.tsx`     |
| Server actions, route handlers      | Vitest with Supabase and `next/navigation` mocked | `app/login/actions.test.ts`        |
| Async Server Components, full flows | Playwright in `e2e/`                              | `e2e/auth.spec.ts`                 |
| RLS policies and triggers           | pgTAP in `supabase/tests/`                        | `supabase/tests/profiles.test.sql` |

- Vitest can't render async Server Components. Cover those pages with Playwright.
- In Playwright, import `test` from `./fixtures` to get a `user` fixture: a fresh account that's already signed in.
- Query elements by role and label (`getByRole`, `getByLabel`), not CSS classes. That tests what users see and keeps the UI accessible.
- Bug fixes should come with a test that failed before the fix. New features need tests only for the parts that meet the bar above.
- CI also fails if `lib/supabase/database.types.ts` doesn't match the migrations. Run `npm run db:types` after a schema change.
