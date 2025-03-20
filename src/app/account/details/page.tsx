"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/account/Account.module.css";

export default function AccountDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isUpdating] = useState(false);
  const [error] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setEmail(user.email || "");
      setDisplayName(user.displayName || "");
    }
  }, [user, loading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement profile update logic here
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className={styles.accountDetailsContainer}>
      <h1 className={styles.pageTitle}>Account Details</h1>

      <form onSubmit={handleUpdateProfile} className={styles.accountForm}>
        {error && <div className={styles.formError}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="displayName" className={styles.formLabel}>
            Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className={`${styles.formInput} ${styles.disabledInput}`}
          />
          <p className={styles.formHelp}>Email cannot be changed</p>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
