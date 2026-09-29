import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { APP_HOME, isPublicRoute } from "@/lib/auth";
import type { Database } from "./database.types";
import { supabaseKey, supabaseUrl } from "./env";

const AUTH_PAGES = ["/login"];

/**
 * Refreshes the Supabase session cookie on every request and does the cheap,
 * optimistic auth redirects. Pages still verify the user themselves.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Don't put code between createServerClient and getClaims: getClaims is
  // what refreshes an expired session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!signedIn && !isPublicRoute(pathname)) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }

  if (signedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo(APP_HOME);
  }

  return response;
}
