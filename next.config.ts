import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Every signed-in page is dynamic, and Next doesn't keep dynamic pages in
    // the browser by default, so going back to the dashboard or a recipe would
    // refetch it and flash its loading skeleton. Keep visited pages for 5 min.
    // Server actions that call revalidatePath clear this cache right away.
    staleTimes: { dynamic: 300 },
  },
};

export default nextConfig;
