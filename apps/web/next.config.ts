import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow the web app to import workspace packages built from source.
  transpilePackages: ["@glow/ui", "@glow/database", "@glow/types"],
  output: "standalone",
};

export default nextConfig;
