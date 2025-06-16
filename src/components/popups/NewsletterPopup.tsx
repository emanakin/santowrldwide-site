"use client";
import React, { useState } from "react";
import styles from "@/styles/popups/NewsletterPopup.module.css";

interface NewsletterPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (email: string, phone?: string) => Promise<void>;
}

export default function NewsletterPopup({
  isVisible,
  onClose,
  onSubmit,
}: NewsletterPopupProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await onSubmit(email.trim(), phone.trim() || undefined);
      setSubmitStatus({
        type: "success",
        message: "Thanks for subscribing! Welcome to the family.",
      });

      // Close popup after successful submission with delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Stay in the Loop</h2>
            <p className={styles.subtitle}>
              Join the SANTOWRLDWIDE family and be the first to know about new
              drops, exclusive content, and special events.
            </p>
          </div>

          {submitStatus.type ? (
            <div
              className={`${styles.statusMessage} ${styles[submitStatus.type]}`}
            >
              {submitStatus.message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className={styles.subscribeButton}
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
          )}

          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🔥</span>
              <span>Early access to new drops</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>📱</span>
              <span>Exclusive content & updates</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🎯</span>
              <span>Special events & announcements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
