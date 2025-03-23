"use client";

import React from "react";
import { Address } from "@/types/user-types";
import styles from "@/styles/account/Account.module.css";

type AddressesProps = {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export default function Addresses({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressesProps) {
  // Confirm address deletion
  const confirmDelete = (address: Address) => {
    if (
      window.confirm(
        `Are you sure you want to delete the address at ${address.address1}?`
      )
    ) {
      onDelete(address.id);
    }
  };

  // Format an address for display
  const formatAddress = (address: Address): string => {
    return [
      address.address1,
      address.address2,
      address.city && address.province
        ? `${address.city}, ${address.province} ${address.zip}`
        : address.city || address.province,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // If no addresses, show empty state
  if (addresses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>You haven&apos;t added any addresses yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.addressList}>
      {addresses.map((address) => (
        <div key={address.id} className={styles.addressCard}>
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Top section with default badge */}
            {address.isDefault && (
              <div
                className={styles.defaultBadge}
                style={{ alignSelf: "flex-start", marginBottom: "0.75rem" }}
              >
                Default
              </div>
            )}

            {/* Address content */}
            <div style={{ flex: 1, marginBottom: "1rem" }}>
              <div style={{ marginBottom: "0.5rem", lineHeight: "1.5" }}>
                {formatAddress(address)}
              </div>
              {address.phone && (
                <div style={{ color: "#666", fontSize: "0.95rem" }}>
                  Phone: {address.phone}
                </div>
              )}
            </div>

            {/* Action buttons at bottom */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                borderTop: "1px solid #eee",
                paddingTop: "0.75rem",
                marginTop: "auto",
              }}
            >
              <button
                onClick={() => onEdit(address)}
                className={styles.addressCardAction}
                aria-label={`Edit address at ${address.address1}`}
              >
                Edit
              </button>

              <button
                onClick={() => confirmDelete(address)}
                className={styles.addressCardAction}
                aria-label={`Delete address at ${address.address1}`}
              >
                Delete
              </button>

              {!address.isDefault && (
                <button
                  onClick={() => onSetDefault(address.id)}
                  className={styles.addressCardAction}
                  aria-label={`Set address at ${address.address1} as default`}
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
