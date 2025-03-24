"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import styles from "@/styles/account/Account.module.css";
import { useAuth } from "@/context/AuthContext";
import { logoutService } from "@/services/client/auth";

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutService();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav
      className={styles.accountNav}
      style={{ position: "relative", zIndex: 10 }}
    >
      <div className={styles.accountNavHeader}>Account</div>
      <Link
        href="/account/orders"
        className={`${styles.accountNavLink} ${
          isActive("/account/orders") ? styles.activeLink : ""
        }`}
      >
        Order History
      </Link>
      <Link
        href="/account/details"
        className={`${styles.accountNavLink} ${
          isActive("/account/details") ? styles.activeLink : ""
        }`}
      >
        Account Details
      </Link>
      <Link
        href="/account/addresses"
        className={`${styles.accountNavLink} ${
          isActive("/account/addresses") ? styles.activeLink : ""
        }`}
      >
        Addresses
      </Link>
      <button onClick={handleLogout} className={styles.accountNavLink}>
        Log out
      </button>
    </nav>
  );
}
