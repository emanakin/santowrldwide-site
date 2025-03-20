"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/account/Account.module.css";

interface Order {
  id: string;
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) return null;

  // This would be fetched from your backend
  const orders: Order[] = [];

  return (
    <div className={styles.ordersContainer}>
      <h1 className={styles.pageTitle}>Order History</h1>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t placed any orders yet.</p>
          <button
            onClick={() => router.push("/")}
            className={styles.shopNowButton}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {/* Orders would be listed here */}
        </div>
      )}
    </div>
  );
}
