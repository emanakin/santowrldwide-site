import type { NextConfig } from "next";

console.log("Loading Next.js config...");

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.shopify.com"],
  },
};

console.log("Next.js config loaded with image domains:", nextConfig.images);

export default nextConfig;
