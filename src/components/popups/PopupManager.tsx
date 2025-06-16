"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewsletterPopup from "./NewsletterPopup";
import CookieConsent from "./CookieConsent";
import {
  isFirstVisit,
  markAsVisited,
  getCookieConsent,
  setCookieConsent,
  isNewsletterDismissed,
  markNewsletterDismissed,
} from "@/utils/visitorTracking";

interface PopupManagerProps {
  children: React.ReactNode;
}

export default function PopupManager({ children }: PopupManagerProps) {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check visitor status
    const firstVisit = isFirstVisit();
    const cookieConsent = getCookieConsent();
    const newsletterDismissed = isNewsletterDismissed();

    // Check if site is in locked mode
    const isLockMode = process.env.NEXT_PUBLIC_LOCK_MODE === "true";

    // Mark as visited if first time
    if (firstVisit) {
      markAsVisited();
    }

    // Show cookie consent if not already set
    if (!cookieConsent) {
      setTimeout(() => {
        setShowCookieConsent(true);
      }, 1000); // Show after 1 second
    }

    // Show newsletter popup for first-time visitors after cookie consent is handled
    // BUT NOT when the site is in locked mode (users can subscribe on locked page)
    if (firstVisit && !newsletterDismissed && !isLockMode) {
      const delay = cookieConsent ? 3000 : 8000; // Longer delay if cookie popup is shown
      setTimeout(() => {
        setShowNewsletterPopup(true);
      }, delay);
    }
  }, []);

  const handleCookieAcceptAll = () => {
    setCookieConsent("all");
    setShowCookieConsent(false);

    // Set up analytics cookies if needed
    // analytics.init() - uncomment when you add analytics
  };

  const handleCookieAcceptTechnical = () => {
    setCookieConsent("technical");
    setShowCookieConsent(false);
  };

  const handleCookieLearnMore = () => {
    router.push("/policy");
  };

  const handleNewsletterSubmit = async (email: string, phone?: string) => {
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }

      // Mark newsletter as dismissed
      markNewsletterDismissed();
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      throw error;
    }
  };

  const handleNewsletterClose = () => {
    setShowNewsletterPopup(false);
    markNewsletterDismissed();
  };

  return (
    <>
      {children}

      <CookieConsent
        isVisible={showCookieConsent}
        onAcceptAll={handleCookieAcceptAll}
        onAcceptTechnical={handleCookieAcceptTechnical}
        onLearnMore={handleCookieLearnMore}
      />

      <NewsletterPopup
        isVisible={showNewsletterPopup}
        onClose={handleNewsletterClose}
        onSubmit={handleNewsletterSubmit}
      />
    </>
  );
}
