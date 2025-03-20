"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/Auth.module.css";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { FirebaseAuthErrorCode, SocialProvider } from "@/types/firebase-types";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export default function SignupPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSignupPanel, setShowSignupPanel, setShowLoginPanel } = useAuth();

  const handleClose = () => {
    setShowSignupPanel(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError("");
    setFieldErrors({});

    // Client-side validation
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);

      // Use the API route instead of direct Firebase call
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API already uses handleFirebaseAuthError, so data is already in ApiError format
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          setError(data.error);
        }
        return;
      }

      // Automatically sign in the user after successful signup
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");

      await signInWithEmailAndPassword(auth, email, password);

      // Close signup panel and redirect to account page
      setShowSignupPanel(false);
      router.push("/account/orders");
    } catch (error: unknown) {
      // Handle network errors
      const apiError = handleFirebaseAuthError(error);
      setError(apiError.error);
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
      setShowSignupPanel(false);
      router.push("/account");
    } catch (error: unknown) {
      // Use the handleFirebaseAuthError utility for consistent error handling
      const apiError = handleFirebaseAuthError(error);

      // Special case for popup closed
      if (apiError.code === FirebaseAuthErrorCode.POPUP_CLOSED_BY_USER) {
        return;
      }

      setError(apiError.error);
    } finally {
      setLoading(false);
    }
  };

  // Show panel only when it's visible
  if (!showSignupPanel) {
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

        <h1 className={styles.authTitle}>SIGN UP</h1>

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

          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Confirm password *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${styles.authInput} ${
                fieldErrors.confirmPassword ? styles.inputError : ""
              }`}
            />
            {fieldErrors.confirmPassword && (
              <div className={styles.fieldError}>
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.authButton}
          >
            {loading ? "REGISTERING..." : "REGISTER"}
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
              setShowSignupPanel(false);
              setShowLoginPanel(true);
            }}
          >
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  );
}
