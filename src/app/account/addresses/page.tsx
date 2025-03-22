"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddAddressForm from "@/components/account/AddAddressForm";
import { Address } from "@/types/user-types";
import styles from "@/styles/account/Account.module.css";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/addresses";

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const fetchedAddresses = await getUserAddresses();
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchAddresses();
    }
  }, [user, loading, router, fetchAddresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleSaveAddress = async (
    addressData: Omit<Address, "id" | "isDefault">
  ) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let savedAddress: Address;

      if (editingAddress) {
        // Update existing address
        savedAddress = await updateAddress(editingAddress.id, addressData);

        // Update addresses state
        setAddresses(
          addresses.map((addr) =>
            addr.id === editingAddress.id ? savedAddress : addr
          )
        );
      } else {
        // Add new address
        savedAddress = await createAddress(addressData);

        // Add to addresses state
        setAddresses([...addresses, savedAddress]);
      }

      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("There was a problem saving your address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await setDefaultAddress(addressId);

      // Update the addresses state to reflect the new default
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error setting default address:", error);
      alert(
        "There was a problem setting your default address. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!user || !confirm("Are you sure you want to delete this address?"))
      return;

    setIsLoading(true);
    try {
      await deleteAddress(addressId);

      // Remove from addresses state
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("There was a problem deleting your address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  if (loading || isLoading) {
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
              {addresses.map((address) => (
                <div key={address.id} className={styles.addressCard}>
                  {address.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                  <div className={styles.addressInfo}>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>
                      {address.city}, {address.province} {address.zip}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>
                  <div className={styles.addressActions}>
                    <button onClick={() => handleEdit(address)}>Edit</button>
                    {!address.isDefault && (
                      <>
                        <button onClick={() => handleSetDefault(address.id)}>
                          Make Default
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
