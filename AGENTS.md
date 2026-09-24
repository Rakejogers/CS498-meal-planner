<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Plenly project notes

- Product brief: `docs/project-overview.md`. The UI should feel food-focused, not AI-focused.
- Schema changes go in `supabase/migrations/` (new file per change, always with RLS). Then run `npm run db:reset` and `npm run db:types`.
- Server data access goes through `lib/data.ts` and `lib/supabase/server.ts`. Validate server action input with zod.
- Design tokens are in `app/globals.css` (shadcn names plus tomato/saffron/sage/plum/sky food tones). Headings use `font-display` (Fraunces).
- Before finishing: `npm run lint && npm run typecheck && npm run build`.
