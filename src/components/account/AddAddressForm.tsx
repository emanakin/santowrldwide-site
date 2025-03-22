"use client";

import React, { useState } from "react";
import { Address } from "@/types/user-types";
import styles from "@/styles/account/Account.module.css";

type AddressFormProps = {
  onSave: (address: Omit<Address, "id" | "isDefault">) => void;
  onCancel: () => void;
  initialData: Address | null;
};

export default function AddAddressForm({
  onSave,
  onCancel,
  initialData,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    address1: initialData?.address1 || "",
    address2: initialData?.address2 || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    country: initialData?.country || "",
    zip: initialData?.zip || "",
    phone: initialData?.phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address1.trim()) {
      newErrors.address1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.province.trim()) {
      newErrors.province = "State/Province is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.zip.trim()) {
      newErrors.zip = "Postal/Zip code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.accountForm}>
      <h2 className={styles.formTitle}>
        {initialData ? "Edit Address" : "Add New Address"}
      </h2>

      <div className={styles.formGroup}>
        <label htmlFor="address1" className={styles.formLabel}>
          Address *
        </label>
        <input
          type="text"
          id="address1"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          className={
            errors.address1
              ? `${styles.formInput} ${styles.inputError}`
              : styles.formInput
          }
        />
        {errors.address1 && (
          <p className={styles.formHelp}>{errors.address1}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="address2" className={styles.formLabel}>
          Apartment, suite, etc.
        </label>
        <input
          type="text"
          id="address2"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formRow}>
        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <label htmlFor="city" className={styles.formLabel}>
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={
              errors.city
                ? `${styles.formInput} ${styles.inputError}`
                : styles.formInput
            }
          />
          {errors.city && <p className={styles.formHelp}>{errors.city}</p>}
        </div>

        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <label htmlFor="province" className={styles.formLabel}>
            State/Province *
          </label>
          <input
            type="text"
            id="province"
            name="province"
            value={formData.province}
            onChange={handleChange}
            className={
              errors.province
                ? `${styles.formInput} ${styles.inputError}`
                : styles.formInput
            }
          />
          {errors.province && (
            <p className={styles.formHelp}>{errors.province}</p>
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <label htmlFor="country" className={styles.formLabel}>
            Country *
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={
              errors.country
                ? `${styles.formInput} ${styles.inputError}`
                : styles.formInput
            }
          />
          {errors.country && (
            <p className={styles.formHelp}>{errors.country}</p>
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
          <label htmlFor="zip" className={styles.formLabel}>
            Postal/Zip Code *
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className={
              errors.zip
                ? `${styles.formInput} ${styles.inputError}`
                : styles.formInput
            }
          />
          {errors.zip && <p className={styles.formHelp}>{errors.zip}</p>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.formLabel}>
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button type="submit" className={styles.saveButton}>
          Save Address
        </button>
      </div>
    </form>
  );
}
