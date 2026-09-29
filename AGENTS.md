<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Plantry project notes

- Product brief: `docs/project-overview.md`. Design guide: `docs/design.md`. The UI should feel food-focused, not AI-focused.
- Conventions (where code goes, testing, security rules): `CONTRIBUTING.md`. Read it before adding a feature.
- The earlier prototype (onboarding, household dashboard) is summarized in `docs/slice-1-reference.md` and kept in the `slice-1-reference` git tag. Restore pieces from there instead of rewriting them.
- Signed-in pages go in `app/(app)/`. Every route is private unless it's in `PUBLIC_ROUTES` (`lib/auth.ts`).
- Server data access goes through `lib/data.ts` and `lib/supabase/server.ts`. Validate server action input with zod.
- Schema changes go in `supabase/migrations/` (new file per change, always with RLS) with a pgTAP test in `supabase/tests/`. Then run `npm run db:reset`, `npm run db:types`, and `npm run test:db`.
- Design tokens are in `app/globals.css` (shadcn names plus tomato/saffron/sage/plum/sky food tones). Headings use `font-display` (Fraunces).
- **Tests must earn their place. Do not add tests to raise coverage or to have a test.** Write one only when it guards logic that can genuinely break: branching, security boundaries (open redirects, RLS, auth), parsing, money/quantity math, retries, or a bug that already happened. Don't test that markup renders, that a link has an href, that a toggle toggles, that copy matches, or that a library (zod, Supabase, React) does its job. Don't duplicate what another layer already proves: if an e2e test covers a flow against real Supabase, skip the mocked unit test of it. A change with no test is fine when nothing in it can meaningfully fail. When touching tests, delete ones that don't meet this bar.
- Before finishing: `npm run check && npm run build`. For UI or auth changes, also run `npm run test:e2e` (needs `npm run db:start`).
