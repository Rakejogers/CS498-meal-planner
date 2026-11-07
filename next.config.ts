import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Extra hostnames that may load the dev server's own resources (HMR, error
  // overlays), such as a VPS IP you browse to from your own machine. Dev only.
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export default nextConfig;
