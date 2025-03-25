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
  // This is a minimal layout with no navbar or footer
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#000" }}>
        {children}
      </body>
    </html>
  );
}
