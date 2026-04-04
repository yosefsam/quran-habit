import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep pg as a Node external so the bundler does not try to inline native deps (common Vercel failure).
  serverExternalPackages: ["pg"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
