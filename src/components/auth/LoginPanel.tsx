"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/Auth.module.css";
import {
  loginWithEmail,
  signInWithGoogle,
  signInWithFacebook,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  FirebaseAuthErrorCode,
  FirebaseAuthError,
  SocialProvider,
} from "@/types/firebase-types";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export default function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showLoginPanel, setShowLoginPanel, setShowSignupPanel } = useAuth();

  const handleClose = () => {
    setShowLoginPanel(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError("");
    setFieldErrors({});

    try {
      setLoading(true);

      await loginWithEmail(email, password);

      // Close panel and redirect to account page
      setShowLoginPanel(false);
      router.push("/account");
    } catch (error: unknown) {
      const apiError = handleFirebaseAuthError(error);

      // If we have a field-specific error, set it
      if (apiError.field) {
        setFieldErrors({ [apiError.field]: apiError.error });
      } else {
        setError(apiError.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(true);
      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithFacebook();
      }
      setShowLoginPanel(false);
      router.push("/account");
    } catch (error: unknown) {
      const apiError = handleFirebaseAuthError(error);

      // Special case for popup closed - don't show as error
      const firebaseError = error as FirebaseAuthError;
      if (firebaseError.code === FirebaseAuthErrorCode.POPUP_CLOSED_BY_USER) {
        return;
      }

      setError(apiError.error);
    } finally {
      setLoading(false);
    }
  };

  // Show panel only when it's visible
  if (!showLoginPanel) {
    return null;
  }

  return (
    <div
      className={`${styles.modalOverlay} ${styles.visible}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.slidePanel} ${styles.visible}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>

        <h1 className={styles.authTitle}>LOG IN</h1>

        {error && <div className={styles.authError}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${styles.authInput} ${
                fieldErrors.email ? styles.inputError : ""
              }`}
            />
            {fieldErrors.email && (
              <div className={styles.fieldError}>{fieldErrors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${styles.authInput} ${
                fieldErrors.password ? styles.inputError : ""
              }`}
            />
            {fieldErrors.password && (
              <div className={styles.fieldError}>{fieldErrors.password}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.authButton}
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <div className={styles.socialSection}>
          <p className={styles.socialText}>Register using Google or Facebook</p>
          <div className={styles.socialButtons}>
            <button
              className={`${styles.socialButton} ${styles.googleButton}`}
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              G
            </button>
            <button
              className={`${styles.socialButton} ${styles.facebookButton}`}
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading}
            >
              f
            </button>
          </div>
        </div>

        <div className={styles.authLinks}>
          <a
            href="#"
            className={styles.authLink}
            onClick={(e) => {
              e.preventDefault();
              setShowLoginPanel(false);
              setShowSignupPanel(true);
            }}
          >
            Register new account
          </a>
        </div>

        <div className={styles.authLinks}>
          <a href="#" className={styles.authLink}>
            Reset password
          </a>
        </div>
      </div>
    </div>
  );
}
