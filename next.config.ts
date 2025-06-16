import type { NextConfig } from "next";
import path from "path";

console.log("Loading Next.js config...");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
