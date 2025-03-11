import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SantoWrldWide",
  description: "Toronto bassed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
