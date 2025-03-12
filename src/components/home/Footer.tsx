import React from "react";
import Link from "next/link";
import styles from "../../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.linksContainer}>
        <div className={styles.linkColumn}>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/shipping-returns" className={styles.link}>
            Shipping & Return
          </Link>
        </div>

        <div className={styles.linkColumn}>
          <Link href="#newsletter" className={styles.link}>
            Newsletter
          </Link>
          <Link href="/policy" className={styles.link}>
            Terms & Conditions
          </Link>
        </div>

        <div className={styles.linkColumn}>
          <Link href="/policy" className={styles.link}>
            Privacy & Cookie Policy
          </Link>
          <Link href="/faq" className={styles.link}>
            FAQ
          </Link>
        </div>
      </div>

      <div className={styles.logo}>SANTOWRLDWIDE</div>
    </footer>
  );
};

export default Footer;
