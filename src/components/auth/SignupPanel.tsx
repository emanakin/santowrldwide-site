// /components/auth/SignupPanel.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/Auth.module.css";
import { useAuth } from "@/context/AuthContext";
import { SocialProvider } from "@/types/firebase-types";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { signupWithEmailService, socialSignupService } from "@/services/auth";

export default function SignupPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    setError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      await signupWithEmailService(email, password, firstName, lastName);
      setShowSignupPanel(false);
      router.push("/account/orders");
    } catch (err: unknown) {
      const apiError = handleFirebaseAuthError(err);
      setError(apiError.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoading(true);
      await socialSignupService(provider);
      setShowSignupPanel(false);
      router.push("/account/orders");
    } catch (err: unknown) {
      const apiError = handleFirebaseAuthError(err);
      // Special case for popup closed
      if (apiError.code === "auth/popup-closed-by-user") return;
      setError(apiError.error);
    } finally {
      setLoading(false);
    }
  };

  if (!showSignupPanel) return null;

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
              id="firstName"
              type="text"
              placeholder="First Name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`${styles.authInput} ${
                fieldErrors.firstName ? styles.inputError : ""
              }`}
              disabled={loading}
            />
            {fieldErrors.firstName && (
              <div className={styles.errorText}>{fieldErrors.firstName}</div>
            )}
          </div>
          <div className={styles.formGroup}>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`${styles.authInput} ${
                fieldErrors.lastName ? styles.inputError : ""
              }`}
              disabled={loading}
            />
            {fieldErrors.lastName && (
              <div className={styles.errorText}>{fieldErrors.lastName}</div>
            )}
          </div>
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
