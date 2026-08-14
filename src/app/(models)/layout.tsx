import React from "react";
import type { Viewport } from "next";
import "../globals.css";
import DarkChrome from "@/components/video/DarkChrome";

export const metadata = {
  title: "Models - SANTOWRLDWIDE",
  description: "Casting for SANTOWRLDWIDE music videos, campaigns and editorial",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent" as const,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  viewportFit: "cover",
};

/**
 * The casting pages run full-bleed on video, so they skip the storefront
 * navbar and footer entirely rather than sitting inside white chrome.
 */
export default function ModelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DarkChrome />
      <div
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000",
          minHeight: "100dvh",
        }}
      >
        {children}
      </div>
    </>
  );
}
