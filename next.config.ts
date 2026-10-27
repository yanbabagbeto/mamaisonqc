import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components force every dynamic read behind a <Suspense> boundary. This app is
  // dominated by DB-driven dynamic pages, so v1 uses the classic App Router model.
  // See docs/adr/ADR-007-classic-cache-model.md.
  cacheComponents: false,
  partialPrefetching: false,
  serverExternalPackages: ["better-sqlite3"],
  // Do not advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      // Next injects inline bootstrap scripts; React Refresh needs eval in dev only.
      `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      // Map tiles (OpenStreetMap) and inline data/blob images.
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://servicescarto.mrnf.gouv.qc.ca",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
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
