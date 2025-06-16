import React from "react";
import "../globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import LoginPanel from "@/components/auth/LoginPanel";
import SignupPanel from "@/components/auth/SignupPanel";
import ResetPasswordPanel from "@/components/auth/ResetPasswordPanel";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import PopupManager from "@/components/popups/PopupManager";

export const metadata = {
  title: "SantoWrldWide",
  description: "Toronto based streetwear",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <PopupManager>
            <Navbar />
            <main style={{ minHeight: "100vh" }}>{children}</main>
            <Footer />
            <LoginPanel />
            <SignupPanel />
            <ResetPasswordPanel />
          </PopupManager>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
