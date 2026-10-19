import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Der Build-Cache von Turbopack hat auf Vercel eine alte Fassung des Tailwind-Themes aus app/globals.css übernommen:
    // Neue Farben (ok, warn, coral-strong, shadow-card …) fehlten live, lokal waren sie da. Jeder Build rechnet daher neu.
    turbopackFileSystemCacheForBuild: false,
  },
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
