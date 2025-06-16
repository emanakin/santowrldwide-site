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
  env: {
    // Video URLs from Cloudflare R2
    NEXT_PUBLIC_HERO_VIDEO_URL:
      "https://pub-9c5280bc16f841f2848160de54fa0828.r2.dev/santo-live.mp4",
    NEXT_PUBLIC_BACKGROUND_VIDEO_URL:
      "https://pub-9c5280bc16f841f2848160de54fa0828.r2.dev/background.mp4",
  },
};

export default nextConfig;
