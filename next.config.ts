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
  cssModules: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

console.log("Next.js config loaded with image domains:", nextConfig.images);

export default nextConfig;
