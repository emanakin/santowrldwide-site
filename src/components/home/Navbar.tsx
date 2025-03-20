"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "@/styles/Navbar.module.css";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const pathname = usePathname();
  const { user, setShowLoginPanel } = useAuth();

  // Check if we're on the home page
  const isHomePage = pathname === "/";

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Toggle menu state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality here
    setSearchQuery("");
  };

  return (
    <div className={styles.navbar}>
      {/* Left-aligned links - visible on desktop */}
      <div className={styles.desktopLinks}>
        <Link
          href="/"
          className={`${styles.link} ${
            isActiveLink("/") ? styles.activeLink : ""
          }`}
        >
          HOME
        </Link>
        <Link
          href="/products"
          className={`${styles.link} ${
            isActiveLink("/products") ? styles.activeLink : ""
          }`}
        >
          DROP
        </Link>
        <Link
          href="/about"
          className={`${styles.link} ${
            isActiveLink("/about") ? styles.activeLink : ""
          }`}
        >
          ABOUT
        </Link>
        <Link
          href="/contact"
          className={`${styles.link} ${
            isActiveLink("/contact") ? styles.activeLink : ""
          }`}
        >
          CONTACT
        </Link>
      </div>

      {/* Center logo - only for non-home pages */}
      {!isHomePage && (
        <div className={styles.centerLogo}>
          <Link href="/">
            <div className={styles.logo}>
              <Image
                src="/images/santo-logo.png"
                alt="SANTOWRLDWIDE"
                width={122}
                height={60}
                priority
              />
            </div>
          </Link>
        </div>
      )}

      {/* Right-aligned icons - visible on desktop */}
      <div className={styles.desktopLinks}>
        {user ? (
          <Link href="/account" className={styles.link}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.icon}
            >
              <path
                d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.146 12.1127 0.438 11.638C0.73 11.1633 1.11733 10.8007 1.6 10.55C2.63333 10.0333 3.68333 9.646 4.75 9.388C5.81667 9.13 6.9 9.00067 8 9C9.1 8.99933 10.1833 9.12867 11.25 9.388C12.3167 9.64733 13.3667 10.0347 14.4 10.55C14.8833 10.8 15.271 11.1627 15.563 11.638C15.855 12.1133 16.0007 12.634 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9543 12.85 13.863 12.7C13.7717 12.55 13.6507 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5627 10.775 11.338C9.85833 11.1133 8.93333 11.0007 8 11C7.06667 10.9993 6.14167 11.112 5.225 11.338C4.30833 11.564 3.4 11.9013 2.5 12.35C2.35 12.4333 2.229 12.55 2.137 12.7C2.045 12.85 1.99933 13.0167 2 13.2V14ZM8 6C8.55 6 9.021 5.80433 9.413 5.413C9.805 5.02167 10.0007 4.55067 10 4C9.99933 3.44933 9.80367 2.97867 9.413 2.588C9.02233 2.19733 8.55133 2.00133 8 2C7.44867 1.99867 6.978 2.19467 6.588 2.588C6.198 2.98133 6.002 3.452 6 4C5.998 4.548 6.194 5.019 6.588 5.413C6.982 5.807 7.45267 6.00267 8 6Z"
                fill="black"
              />
            </svg>
            ACCOUNT
          </Link>
        ) : (
          <a
            href="#"
            className={styles.link}
            onClick={(e) => {
              e.preventDefault();
              setShowLoginPanel(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.icon}
            >
              <path
                d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.146 12.1127 0.438 11.638C0.73 11.1633 1.11733 10.8007 1.6 10.55C2.63333 10.0333 3.68333 9.646 4.75 9.388C5.81667 9.13 6.9 9.00067 8 9C9.1 8.99933 10.1833 9.12867 11.25 9.388C12.3167 9.64733 13.3667 10.0347 14.4 10.55C14.8833 10.8 15.271 11.1627 15.563 11.638C15.855 12.1133 16.0007 12.634 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9543 12.85 13.863 12.7C13.7717 12.55 13.6507 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5627 10.775 11.338C9.85833 11.1133 8.93333 11.0007 8 11C7.06667 10.9993 6.14167 11.112 5.225 11.338C4.30833 11.564 3.4 11.9013 2.5 12.35C2.35 12.4333 2.229 12.55 2.137 12.7C2.045 12.85 1.99933 13.0167 2 13.2V14ZM8 6C8.55 6 9.021 5.80433 9.413 5.413C9.805 5.02167 10.0007 4.55067 10 4C9.99933 3.44933 9.80367 2.97867 9.413 2.588C9.02233 2.19733 8.55133 2.00133 8 2C7.44867 1.99867 6.978 2.19467 6.588 2.588C6.198 2.98133 6.002 3.452 6 4C5.998 4.548 6.194 5.019 6.588 5.413C6.982 5.807 7.45267 6.00267 8 6Z"
                fill="black"
              />
            </svg>
            LOGIN
          </a>
        )}
        <Link
          href="#"
          className={styles.link}
          onClick={(e) => {
            e.preventDefault();
            toggleMenu();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.icon}
          >
            <path
              d="M11.4351 10.0629H10.7124L10.4563 9.81589C11.3838 8.74014 11.8936 7.36669 11.8925 5.94626C11.8925 4.7702 11.5438 3.62055 10.8904 2.6427C10.237 1.66484 9.30832 0.902692 8.22179 0.452634C7.13525 0.00257642 5.93966 -0.115179 4.7862 0.114258C3.63274 0.343696 2.57322 0.910021 1.74162 1.74162C0.910021 2.57322 0.343696 3.63274 0.114258 4.7862C-0.115179 5.93966 0.00257642 7.13525 0.452634 8.22179C0.902692 9.30832 1.66484 10.237 2.6427 10.8904C3.62055 11.5438 4.7702 11.8925 5.94626 11.8925C7.4191 11.8925 8.77301 11.3528 9.81589 10.4563L10.0629 10.7124V11.4351L14.6369 16L16 14.6369L11.4351 10.0629ZM5.94626 10.0629C3.66838 10.0629 1.82962 8.22413 1.82962 5.94626C1.82962 3.66838 3.66838 1.82962 5.94626 1.82962C8.22413 1.82962 10.0629 3.66838 10.0629 5.94626C10.0629 8.22413 8.22413 10.0629 5.94626 10.0629Z"
              fill="black"
            />
          </svg>
          SEARCH
        </Link>
        <Link href="/cart" className={styles.link}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={styles.icon}
          >
            <path
              d="M13.3636 4H10.6591V3.68C10.6591 1.648 9.02045 0 7 0C4.97955 0 3.34091 1.648 3.34091 3.68V4H0.636364C0.284375 4 0 4.286 0 4.64V15.36C0 15.714 0.284375 16 0.636364 16H13.3636C13.7156 16 14 15.714 14 15.36V4.64C14 4.286 13.7156 4 13.3636 4ZM4.77273 3.68C4.77273 2.442 5.76903 1.44 7 1.44C8.23097 1.44 9.22727 2.442 9.22727 3.68V4H4.77273V3.68ZM12.5682 14.56H1.43182V5.44H3.34091V7.2C3.34091 7.288 3.4125 7.36 3.5 7.36H4.61364C4.70114 7.36 4.77273 7.288 4.77273 7.2V5.44H9.22727V7.2C9.22727 7.288 9.29886 7.36 9.38636 7.36H10.5C10.5875 7.36 10.6591 7.288 10.6591 7.2V5.44H12.5682V14.56Z"
              fill="black"
            />
          </svg>
          BAG ( {cartCount} )
        </Link>
      </div>

      {/* Hamburger button - visible on mobile */}
      <button
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      {/* Mobile menu overlay - full screen */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <div className={styles.mobileMenuContent}>
          {/* Search bar */}
          <form className={styles.searchContainer} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M11.4351 10.0629H10.7124L10.4563 9.81589C11.3838 8.74014 11.8936 7.36669 11.8925 5.94626C11.8925 4.7702 11.5438 3.62055 10.8904 2.6427C10.237 1.66484 9.30832 0.902692 8.22179 0.452634C7.13525 0.00257642 5.93966 -0.115179 4.7862 0.114258C3.63274 0.343696 2.57322 0.910021 1.74162 1.74162C0.910021 2.57322 0.343696 3.63274 0.114258 4.7862C-0.115179 5.93966 0.00257642 7.13525 0.452634 8.22179C0.902692 9.30832 1.66484 10.237 2.6427 10.8904C3.62055 11.5438 4.7702 11.8925 5.94626 11.8925C7.4191 11.8925 8.77301 11.3528 9.81589 10.4563L10.0629 10.7124V11.4351L14.6369 16L16 14.6369L11.4351 10.0629ZM5.94626 10.0629C3.66838 10.0629 1.82962 8.22413 1.82962 5.94626C1.82962 3.66838 3.66838 1.82962 5.94626 1.82962C8.22413 1.82962 10.0629 3.66838 10.0629 5.94626C10.0629 8.22413 8.22413 10.0629 5.94626 10.0629Z"
                  fill="#555"
                />
              </svg>
            </button>
          </form>

          {/* Primary navigation links */}
          <Link
            href="/"
            className={`${styles.mobileLink} ${
              isActiveLink("/") ? styles.activeLink : ""
            }`}
          >
            HOME
          </Link>
          <Link
            href="/products"
            className={`${styles.mobileLink} ${
              isActiveLink("/products") ? styles.activeLink : ""
            }`}
          >
            DROP
          </Link>
          <Link
            href="/about"
            className={`${styles.mobileLink} ${
              isActiveLink("/about") ? styles.activeLink : ""
            }`}
          >
            ABOUT
          </Link>
          <Link
            href="/contact"
            className={`${styles.mobileLink} ${
              isActiveLink("/contact") ? styles.activeLink : ""
            }`}
          >
            CONTACT
          </Link>

          {/* Secondary utility links */}
          <div className={styles.mobileUtilityLinks}>
            <Link href="/login" className={styles.mobileUtilityLink}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.icon}
              >
                <path
                  d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.146 12.1127 0.438 11.638C0.73 11.1633 1.11733 10.8007 1.6 10.55C2.63333 10.0333 3.68333 9.646 4.75 9.388C5.81667 9.13 6.9 9.00067 8 9C9.1 8.99933 10.1833 9.12867 11.25 9.388C12.3167 9.64733 13.3667 10.0347 14.4 10.55C14.8833 10.8 15.271 11.1627 15.563 11.638C15.855 12.1133 16.0007 12.634 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9543 12.85 13.863 12.7C13.7717 12.55 13.6507 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5627 10.775 11.338C9.85833 11.1133 8.93333 11.0007 8 11C7.06667 10.9993 6.14167 11.112 5.225 11.338C4.30833 11.564 3.4 11.9013 2.5 12.35C2.35 12.4333 2.229 12.55 2.137 12.7C2.045 12.85 1.99933 13.0167 2 13.2V14ZM8 6C8.55 6 9.021 5.80433 9.413 5.413C9.805 5.02167 10.0007 4.55067 10 4C9.99933 3.44933 9.80367 2.97867 9.413 2.588C9.02233 2.19733 8.55133 2.00133 8 2C7.44867 1.99867 6.978 2.19467 6.588 2.588C6.198 2.98133 6.002 3.452 6 4C5.998 4.548 6.194 5.019 6.588 5.413C6.982 5.807 7.45267 6.00267 8 6Z"
                  fill="black"
                />
              </svg>
              LOGIN
            </Link>
            <Link href="/cart" className={styles.mobileUtilityLink}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                className={styles.icon}
              >
                <path
                  d="M13.3636 4H10.6591V3.68C10.6591 1.648 9.02045 0 7 0C4.97955 0 3.34091 1.648 3.34091 3.68V4H0.636364C0.284375 4 0 4.286 0 4.64V15.36C0 15.714 0.284375 16 0.636364 16H13.3636C13.7156 16 14 15.714 14 15.36V4.64C14 4.286 13.7156 4 13.3636 4ZM4.77273 3.68C4.77273 2.442 5.76903 1.44 7 1.44C8.23097 1.44 9.22727 2.442 9.22727 3.68V4H4.77273V3.68ZM12.5682 14.56H1.43182V5.44H3.34091V7.2C3.34091 7.288 3.4125 7.36 3.5 7.36H4.61364C4.70114 7.36 4.77273 7.288 4.77273 7.2V5.44H9.22727V7.2C9.22727 7.288 9.29886 7.36 9.38636 7.36H10.5C10.5875 7.36 10.6591 7.288 10.6591 7.2V5.44H12.5682V14.56Z"
                  fill="black"
                />
              </svg>
              BAG
            </Link>
          </div>

          {/* Tertiary footer links */}
          <div className={styles.mobileFooterLinks}>
            <Link href="/contact" className={styles.mobileFooterLink}>
              Contact
            </Link>
            <Link href="/shipping-returns" className={styles.mobileFooterLink}>
              Shipping & Return
            </Link>
            <Link href="#newsletter" className={styles.mobileFooterLink}>
              Newsletter
            </Link>
            <Link href="/policy" className={styles.mobileFooterLink}>
              Terms & Conditions
            </Link>
            <Link href="/policy" className={styles.mobileFooterLink}>
              Privacy & Cookie Policy
            </Link>
            <Link href="/faq" className={styles.mobileFooterLink}>
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
