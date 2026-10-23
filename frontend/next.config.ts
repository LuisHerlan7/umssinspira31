import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Derived at build time: a public flag alone cannot enable a Production deploy.
  env: {
    NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED: String(
      process.env.VERCEL === '1' &&
      process.env.VERCEL_ENV === 'preview' &&
      process.env.HU8_PREVIEW_DEMO === 'true',
    ),
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
