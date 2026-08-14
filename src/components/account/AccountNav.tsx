"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import styles from "@/styles/account/Account.module.css";
import { logoutService } from "@/services/client/auth";
import { useAuth } from "@/context/AuthContext";

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, isSuperAdmin } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

  // Models/Shoots have nested detail routes, so match the whole section
  const isActiveSection = (path: string) => {
    return pathname.startsWith(path);
  };

  const isShootsActive = isActiveSection("/account/models/shoots");
  const isModelsActive = isActiveSection("/account/models") && !isShootsActive;

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <button
        className={`${styles.mobileNavToggle} ${isMobileNavOpen ? styles.open : ""}`}
        onClick={toggleMobileNav}
      >
        Account Navigation
      </button>

      {/* Mobile Navigation Content */}
      <div
        className={`${styles.mobileNavContent} ${isMobileNavOpen ? styles.open : ""}`}
      >
        <Link
          href="/account/orders"
          className={`${styles.accountNavLink} ${
            isActive("/account/orders") ? styles.activeLink : ""
          }`}
          onClick={closeMobileNav}
        >
          Order History
        </Link>
        <Link
          href="/account/details"
          className={`${styles.accountNavLink} ${
            isActive("/account/details") ? styles.activeLink : ""
          }`}
          onClick={closeMobileNav}
        >
          Account Details
        </Link>
        <Link
          href="/account/addresses"
          className={`${styles.accountNavLink} ${
            isActive("/account/addresses") ? styles.activeLink : ""
          }`}
          onClick={closeMobileNav}
        >
          Addresses
        </Link>
        <Link
          href="/account/wishlist"
          className={`${styles.accountNavLink} ${
            isActive("/account/wishlist") ? styles.activeLink : ""
          }`}
          onClick={closeMobileNav}
        >
          Wishlist
        </Link>
        {isSuperAdmin && (
          <>
            <Link
              href="/account/models"
              className={`${styles.accountNavLink} ${
                isModelsActive ? styles.activeLink : ""
              }`}
              onClick={closeMobileNav}
            >
              Models
            </Link>
            <Link
              href="/account/models/shoots"
              className={`${styles.accountNavLink} ${
                isShootsActive ? styles.activeLink : ""
              }`}
              onClick={closeMobileNav}
            >
              Shoots
            </Link>
          </>
        )}
        <button
          onClick={() => {
            handleLogout();
            closeMobileNav();
          }}
          className={styles.accountNavLink}
        >
          Log out
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className={styles.accountNav}>
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
        <Link
          href="/account/wishlist"
          className={`${styles.accountNavLink} ${
            isActive("/account/wishlist") ? styles.activeLink : ""
          }`}
        >
          Wishlist
        </Link>
        {isSuperAdmin && (
          <>
            <Link
              href="/account/models"
              className={`${styles.accountNavLink} ${
                isModelsActive ? styles.activeLink : ""
              }`}
            >
              Models
            </Link>
            <Link
              href="/account/models/shoots"
              className={`${styles.accountNavLink} ${
                isShootsActive ? styles.activeLink : ""
              }`}
            >
              Shoots
            </Link>
          </>
        )}
        <button onClick={handleLogout} className={styles.accountNavLink}>
          Log out
        </button>
      </nav>
    </>
  );
}
