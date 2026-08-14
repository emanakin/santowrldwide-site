import React from "react";
import type { Viewport } from "next";
import "../globals.css";
import DarkChrome from "@/components/video/DarkChrome";
import { VIDEOS } from "@/lib/media";

export const metadata = {
  title: "SantoWrldWide - Locked",
  description: "Toronto based streetwear",
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

export default function LockedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preload" as="video" href={VIDEOS.background} type="video/mp4" />
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
