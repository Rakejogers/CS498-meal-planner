const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase env vars. Run `npm run db:start` then `npm run env:local` (see README).",
  );
}

export const supabaseUrl = url;
export const supabaseKey = key;
