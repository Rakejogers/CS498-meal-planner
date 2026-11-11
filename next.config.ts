import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Google profile photos in the account menu. Must match googleAvatarUrl (lib/auth.ts).
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", search: "" },
    ],
  },
  experimental: {
    // Every signed-in page is dynamic, and Next doesn't keep dynamic pages in
    // the browser by default, so going back to the dashboard or a recipe would
    // refetch it and flash its loading skeleton. Keep visited pages for 5 min.
    // Server actions that call revalidatePath clear this cache right away.
    staleTimes: { dynamic: 300 },
  },
};

export default nextConfig;
