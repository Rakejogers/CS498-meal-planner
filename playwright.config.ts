import { defineConfig, devices } from "@playwright/test";

// `next dev` and `next start` both read PORT, so the web server below follows it.
const baseURL = `http://localhost:${process.env.PORT ?? 3000}`;
const isCI = Boolean(process.env.CI);

/**
 * End-to-end tests. They need the local Supabase stack running (`npm run db:start`).
 * Locally they reuse your `npm run dev` server if it's up; CI runs a production build.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: isCI ? "npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
