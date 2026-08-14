"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/styles/locked/locked.module.css";
import BackgroundVideo from "@/components/video/BackgroundVideo";
import { VIDEOS } from "@/lib/media";

export default function LockedPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone: phone.trim() || undefined, // Only send phone if provided
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionStatus(data.message || "Thanks for subscribing!");
        setEmail("");
        setPhone("");
        // Clear the status message after 5 seconds
        setTimeout(() => setSubscriptionStatus(null), 5000);
      } else {
        setSubscriptionStatus(
          data.error || "Something went wrong. Please try again."
        );
        // Clear error message after 3 seconds
        setTimeout(() => setSubscriptionStatus(null), 3000);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      setSubscriptionStatus("Something went wrong. Please try again.");
      // Clear error message after 3 seconds
      setTimeout(() => setSubscriptionStatus(null), 3000);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Set a cookie or session to indicate the site is unlocked for this user
        document.cookie = "site_unlocked=true; path=/; max-age=3600";
        router.push("/");
      } else {
        alert("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Error unlocking:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className={styles.lockedContainer}>
        {/* Background video, mute button and dark overlay */}
        <BackgroundVideo src={VIDEOS.background} overlayOpacity={0.7} />

        {/* Content container */}
        <div className={styles.contentContainer}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Image
              src="/images/white-cross-logo.png"
              alt="SANTOWRLDWIDE"
              width={200}
              height={200}
              priority
            />
          </div>

          {/* Message */}
          <p className={styles.message}>always stay in the loop when we drop</p>

          {/* Email subscription form */}
          <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={styles.emailInput}
              required
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={styles.phoneInput}
            />
            <button type="submit" className={styles.subscribeButton}>
              subscribe
            </button>
          </form>

          {/* Access website link */}
          <div className={styles.accessLink}>
            <button
              onClick={() => setShowPasswordModal(true)}
              className={styles.accessButton}
            >
              access website?
            </button>
          </div>

          {/* Subscription status message */}
          {subscriptionStatus && (
            <div className={styles.statusMessage}>{subscriptionStatus}</div>
          )}
        </div>

        {/* Password modal */}
        {showPasswordModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowPasswordModal(false)}
          >
            <div
              className={styles.passwordModal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Enter Password</h2>
              <form onSubmit={handleUnlock}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={styles.passwordInput}
                  required
                />
                <button type="submit" className={styles.unlockButton}>
                  Unlock Website
                </button>
              </form>
              <button
                className={styles.closeButton}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
