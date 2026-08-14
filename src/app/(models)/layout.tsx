import React from "react";
import "../globals.css";
import { VIDEOS } from "@/lib/media";

export const metadata = {
  title: "Models - SANTOWRLDWIDE",
  description: "Casting for SANTOWRLDWIDE music videos, campaigns and editorial",
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
      <head>
        <link
          rel="preload"
          as="video"
          href={VIDEOS.feelAlive}
          type="video/mp4"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <div
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </>
  );
}
