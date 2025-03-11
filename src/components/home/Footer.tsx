import React from "react";
import styles from "../../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.linksContainer}>
        <div className={styles.linkColumn}>
          <a href="/contact" className={styles.link}>
            Contact
          </a>
          <a href="/shipping-return" className={styles.link}>
            Shipping & Return
          </a>
        </div>

        <div className={styles.linkColumn}>
          <a href="/newsletter" className={styles.link}>
            Newsletter
          </a>
          <a href="/terms" className={styles.link}>
            Terms & Conditions
          </a>
        </div>

        <div className={styles.linkColumn}>
          <a href="/privacy" className={styles.link}>
            Privacy & Cookie Policy
          </a>
          <a href="/faq" className={styles.link}>
            FAQ
          </a>
        </div>
      </div>

      <div className={styles.logo}>SANTOWRLDWIDE</div>
    </footer>
  );
};

export default Footer;
