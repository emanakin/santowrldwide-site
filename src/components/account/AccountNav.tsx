"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/firebase/client/auth";
import styles from "@/styles/account/Account.module.css";

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={styles.accountNav}>
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
