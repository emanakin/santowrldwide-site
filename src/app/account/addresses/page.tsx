"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddAddressForm from "@/components/account/AddAddressForm";
import styles from "@/styles/account/Account.module.css";

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [addresses] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      // Fetch user addresses here
      // For now, just using empty array
    }
  }, [user, loading, router]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleSaveAddress = async (addressData: any) => {
    // Save address logic would go here
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className={styles.addressesContainer}>
      <h1 className={styles.pageTitle}>Addresses</h1>

      {showAddForm ? (
        <AddAddressForm
          onSave={handleSaveAddress}
          onCancel={handleCancelAdd}
          initialData={editingAddress}
        />
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven&apos;t saved any addresses yet.</p>
              <button onClick={handleAddNew} className={styles.addButton}>
                Add New Address
              </button>
            </div>
          ) : (
            <div className={styles.addressList}>
              {/* List of addresses would go here */}
              <button onClick={handleAddNew} className={styles.addButton}>
                Add New Address
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
