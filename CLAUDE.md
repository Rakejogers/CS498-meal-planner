# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Plantry is a household meal planner and grocery manager (Next.js 16 App Router + Supabase). Setup and local service URLs are in `README.md`; conventions and the "where code goes" table are in `CONTRIBUTING.md`.

## Commands

```bash
npm run dev                      # http://localhost:3000
npm run check                    # lint + prettier check + typecheck (next typegen && tsc) + vitest
npm run build
npm test                         # vitest (unit/component)
npx vitest run lib/auth.test.ts  # single vitest file; add -t "name" for one test
npm run test:e2e                 # playwright; needs Supabase running
npx playwright test e2e/auth.spec.ts   # single e2e file
npm run db:start                 # local Supabase in Docker (ports 583xx, not 543xx)
npm run env:local                # write .env.local from the running stack
npm run db:reset && npm run db:types && npm run test:db   # after any migration
```

- Node 24 (`.nvmrc`). Shell examples in docs assume bash.
- `db:reset` wipes all users, so you'll be signed out after it.
- `lib/supabase/database.types.ts` is generated and committed; CI fails if it's stale.
- Vitest only picks up `{app,components,lib,scripts}/**/*.test.{ts,tsx}`; Playwright only `e2e/`. Vitest can't render async Server Components, so cover those with Playwright.

## Architecture

**Auth is layered, and only the inner layers are security boundaries.**

1. `proxy.ts` (Next 16's replacement for `middleware.ts`) calls `lib/supabase/proxy.ts#updateSession`, which refreshes the session cookie via `getClaims()` and does optimistic redirects: signed-out users on non-public routes go to `/login?next=…`, signed-in users on `/login` go to `APP_HOME`. Route publicity comes from `PUBLIC_ROUTES` in `lib/auth.ts` (private by default). Redirect targets must go through `safeNextPath`.
2. `lib/data.ts` (`server-only`) is the data access layer. Every loader calls `requireUser()` and is wrapped in React `cache` so layout and page share one request. Add new server reads (and shared writes) here, not in pages.
3. Postgres RLS is the real boundary. Every table needs RLS, policies, explicit grants, and a pgTAP test proving users see only their own rows. `supabase/tests/rls_enabled.test.sql` fails if any table lacks RLS.

**Signed-in flow:** `app/(app)/layout.tsx` loads `getProfile()` and redirects to `/onboarding` until `profiles.onboarded_at` is set. `/onboarding` lives outside `(app)` so it skips that shell but is still private. If a session belongs to a deleted user (e.g. after `db:reset`), `getProfile` redirects to `/auth/signout`.

**Forms:** shared domain modules (`lib/preferences.ts`, `lib/household.ts`) hold the zod schema, the `parse…Form(formData)` helper, and the normalization rules, so the client form and the server action agree on what's valid. Server actions (`app/<route>/actions.ts`) parse, call a `lib/data.ts` writer that returns `{ ok }`, then return `{ error }` or `revalidatePath`/`redirect`. The user always comes from the session, never the form. Field components shared by onboarding and settings live in `components/` (e.g. `food-preferences-fields.tsx`, `household-size-field.tsx`).

**Supabase clients:** `lib/supabase/server.ts` (Server Components/Actions/Route Handlers), `client.ts` (browser), `proxy.ts` (proxy only). Server clients use `supabaseFetch` (`lib/supabase/fetch.ts`), which retries PostgREST's transient `PGRST303 "JWT issued at future"` right after a token is minted. Keep that fetch on any new server client.

**Domain rules worth knowing:** food names are normalized (trim, lowercase, collapse spaces), and a food can be in only one list, with the stricter list winning (cannot eat > dislikes > likes). Household size is 1–12, matching a DB check constraint. Planned principle: AI suggests meals, while quantities and grocery math are pure, unit-tested functions in `lib/<area>.ts`, and model output is validated with zod. External services go in `lib/<service>/` starting with `import "server-only"`.

## Testing notes

- In Playwright, import `test` from `e2e/fixtures.ts` to get a fresh signed-up `user` that has already skipped onboarding. Use `createAccount` to stop at onboarding instead. Query by role or label.
- Server actions and route handlers are tested in Vitest with Supabase and `next/navigation` mocked (see `app/login/actions.test.ts`).
- Playwright sets `PLAN_GENERATOR=fake` (`lib/ai/fake-meals.ts`) so e2e never calls the model, except when it reuses a running `npm run dev` server.
- Bug fixes get a test that failed before the fix.

## CI

`.github/workflows/ci.yml`: (1) lint, format, typecheck, unit tests, build; (2) start Supabase, pgTAP, production build, Playwright. Branch names are `feature/…`, `fix/…`, `chore/…`, and PRs are squash-merged.
 