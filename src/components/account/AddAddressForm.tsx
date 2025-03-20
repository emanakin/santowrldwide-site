"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/account/Account.module.css";

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "UK", name: "United Kingdom" },
  // Add more countries as needed
];

interface AddressFormProps {
  onSave: (addressData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function AddAddressForm({
  onSave,
  onCancel,
  initialData,
}: AddressFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || "");
      setLastName(initialData.lastName || "");
      setCompany(initialData.company || "");
      setStreetAddress(initialData.streetAddress || "");
      setCountry(initialData.country || "");
      setCity(initialData.city || "");
      setPostalCode(initialData.postalCode || "");
      setPhone(initialData.phone || "");
      setIsDefaultBilling(initialData.isDefaultBilling || false);
      setIsDefaultShipping(initialData.isDefaultShipping || false);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addressData = {
      firstName,
      lastName,
      company,
      streetAddress,
      country,
      city,
      postalCode,
      phone,
      isDefaultBilling,
      isDefaultShipping,
    };
    onSave(addressData);
  };

  return (
    <div className={styles.addressFormContainer}>
      <h2 className={styles.formTitle}>Add an address</h2>

      <form onSubmit={handleSubmit} className={styles.addressForm}>
        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.formLabel}>
            First name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName" className={styles.formLabel}>
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="company" className={styles.formLabel}>
            Company
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="streetAddress" className={styles.formLabel}>
            Street address
          </label>
          <input
            type="text"
            id="streetAddress"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="country" className={styles.formLabel}>
            Country / Region
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={styles.formSelect}
            required
          >
            <option value="">Select</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="city" className={styles.formLabel}>
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={`${styles.formGroup} ${styles.halfWidth}`}>
            <label htmlFor="postalCode" className={styles.formLabel}>
              Postal code
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className={styles.formInput}
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.halfWidth}`}>
            <label htmlFor="phone" className={styles.formLabel}>
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.formInput}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="defaultBilling"
              checked={isDefaultBilling}
              onChange={(e) => setIsDefaultBilling(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="defaultBilling">
              Set as default billing address
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="defaultShipping"
              checked={isDefaultShipping}
              onChange={(e) => setIsDefaultShipping(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="defaultShipping">
              Set as default shipping address
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            CANCEL
          </button>
          <button type="submit" className={styles.saveButton}>
            SAVE
          </button>
        </div>
      </form>
    </div>
  );
}
