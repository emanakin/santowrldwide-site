"use client";

import React, { useState } from "react";
import styles from "@/styles/auth/Auth.module.css";
import { resetPassword } from "@/lib/firebase";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPanel() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showResetPanel, setShowResetPanel, setShowLoginPanel } = useAuth();

  const handleClose = () => {
    setShowResetPanel(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and success
    setError("");
    setFieldErrors({});
    setSuccess(false);

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
      setEmail(""); // Clear the form
    } catch (error: unknown) {
      const apiError = handleFirebaseAuthError(error);

      if (apiError.field) {
        setFieldErrors({ [apiError.field]: apiError.error });
      } else {
        setError(apiError.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!showResetPanel) return null;

  return (
    <div className={styles.authOverlay}>
      <div
        className={`${styles.slidePanel} ${showResetPanel ? styles.open : ""}`}
      >
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.authContent}>
          <h2 className={styles.authTitle}>RESET PASSWORD</h2>

          {success ? (
            <div className={styles.successMessage}>
              <p>Password reset email has been sent.</p>
              <p>Please check your inbox and follow the instructions.</p>
              <button
                className={styles.authButton}
                onClick={() => {
                  setShowResetPanel(false);
                  setShowLoginPanel(true);
                }}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              {error && <div className={styles.authError}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${styles.authInput} ${
                      fieldErrors.email ? styles.inputError : ""
                    }`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className={styles.fieldError}>{fieldErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.authButton}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Reset Password"}
                </button>
              </form>

              <div className={styles.authLinks}>
                <a
                  href="#"
                  className={styles.authLink}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowResetPanel(false);
                    setShowLoginPanel(true);
                  }}
                >
                  Back to login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
