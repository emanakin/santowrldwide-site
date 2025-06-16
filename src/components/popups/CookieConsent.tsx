"use client";
import React from "react";
import styles from "@/styles/popups/CookieConsent.module.css";

interface CookieConsentProps {
  isVisible: boolean;
  onAcceptAll: () => void;
  onAcceptTechnical: () => void;
  onLearnMore: () => void;
}

export default function CookieConsent({
  isVisible,
  onAcceptAll,
  onAcceptTechnical,
  onLearnMore,
}: CookieConsentProps) {
  if (!isVisible) return null;

  return (
    <div className={styles.cookieBar}>
      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.message}>
            With your consent, we and our partners use cookies or similar
            technologies to store, access, and process personal data (e.g., your
            browsing data) for site functionality, analytics, personalization
            and advertising. You can accept all cookies or limit your consent to
            only those necessary for the site to function.{" "}
            <button className={styles.learnMoreButton} onClick={onLearnMore}>
              LEARN MORE
            </button>
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.technicalButton}
            onClick={onAcceptTechnical}
          >
            ACCEPT ONLY TECHNICAL COOKIES
          </button>
          <button className={styles.acceptButton} onClick={onAcceptAll}>
            ACCEPT ALL COOKIES
          </button>
        </div>
      </div>
    </div>
  );
}
