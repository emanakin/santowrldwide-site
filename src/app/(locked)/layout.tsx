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

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        <meta name="theme-color" content="#000000" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
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
