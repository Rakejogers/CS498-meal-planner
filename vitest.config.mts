import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Unit and component tests. End-to-end tests live in e2e/ and run with Playwright.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    // Tests live next to source. Docs, assets, generated output, and e2e specs
    // cannot become unit tests just by having a matching filename.
    include: ["{app,components,lib,scripts}/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
