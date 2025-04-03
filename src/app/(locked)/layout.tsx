import React from "react";
import "../globals.css";

export const metadata = {
  title: "SantoWrldWide - Locked",
  description: "Toronto based streetwear",
};

export default function LockedLayout({
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
          href="/videos/background.mp4"
          type="video/mp4"
        />
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
