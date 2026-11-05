/**
 * True only under `next dev`. Gates tools for testing the app on your own
 * machine; production builds (including `next start`) never show them.
 */
export const isDev = process.env.NODE_ENV === "development";
