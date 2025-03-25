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
      <body>{children}</body>
    </html>
  );
}
