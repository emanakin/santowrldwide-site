import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import LoginPanel from "@/components/auth/LoginPanel";
import SignupPanel from "@/components/auth/SignupPanel";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

export const metadata = {
  title: "SantoWrldWide",
  description: "Toronto based streetwear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main style={{ minHeight: "100vh" }}>{children}</main>
            <Footer />
            <LoginPanel />
            <SignupPanel />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
