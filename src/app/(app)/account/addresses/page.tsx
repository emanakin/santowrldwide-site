"use client";

import React, { useEffect, useState } from "react";
import AddAddressForm from "@/components/account/AddAddressForm";
import Addresses from "@/components/account/Addresses";
import { Address } from "@/types/user-types";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/client/addresses";
import styles from "@/styles/account/Account.module.css";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key for forcing re-renders

  // Force a refresh of the component
  const refreshAddresses = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const data = await getUserAddresses();
        setAddresses(data);
        setError("");
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setError("Failed to load your addresses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  // Handle adding address
  const handleAddAddress = async (
    addressData: Omit<Address, "id" | "isDefault">
  ) => {
    try {
      setLoading(true);
      await createAddress(addressData);
      refreshAddresses(); // Force refresh after creation
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding address:", err);
      setError("Failed to add address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle updating address
  const handleUpdateAddress = async (
    id: string,
    addressData: Omit<Address, "id" | "isDefault">
  ) => {
    try {
      setLoading(true);
      await updateAddress(id, addressData);
      refreshAddresses(); // Force refresh after update
      setEditingAddress(null);
    } catch (err) {
      console.error("Error updating address:", err);
      setError("Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting address
  const handleDeleteAddress = async (id: string) => {
    try {
      setLoading(true);
      await deleteAddress(id);
      refreshAddresses(); // Force refresh after deletion
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (id: string) => {
    try {
      setLoading(true);
      await setDefaultAddress(id);
      refreshAddresses(); // Force refresh after setting default
    } catch (err) {
      console.error("Error setting default address:", err);
      setError("Failed to set default address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Start editing an address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(false);
  };

  // Cancel add/edit form
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  // Show add form
  const handleShowAddForm = () => {
    setShowAddForm(true);
    setEditingAddress(null);
  };

  // Form submission handler (add or update)
  const handleFormSubmit = (addressData: Omit<Address, "id" | "isDefault">) => {
    if (editingAddress) {
      handleUpdateAddress(editingAddress.id, addressData);
    } else {
      handleAddAddress(addressData);
    }
  };

  return (
    <div className={styles.accountContainer}>
      {error && <div className={styles.formError}>{error}</div>}

      {loading && !showAddForm && !editingAddress ? (
        <div className={styles.loading}>Loading your addresses...</div>
      ) : (
        <>
          {showAddForm || editingAddress ? (
            <AddAddressForm
              onSave={handleFormSubmit}
              onCancel={handleCancel}
              initialData={editingAddress}
            />
          ) : (
            <Addresses
              addresses={addresses}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefaultAddress}
            />
          )}
          {!showAddForm && !editingAddress && (
            <div style={{ marginBottom: "1.5rem" }}>
              <button onClick={handleShowAddForm} className={styles.addButton}>
                Add a New Address
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
