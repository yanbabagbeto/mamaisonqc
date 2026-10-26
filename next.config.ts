import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components force every dynamic read behind a <Suspense> boundary. This app is
  // dominated by DB-driven dynamic pages, so v1 uses the classic App Router model.
  // See docs/adr/ADR-007-classic-cache-model.md.
  cacheComponents: false,
  partialPrefetching: false,
  serverExternalPackages: ["better-sqlite3"],
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
