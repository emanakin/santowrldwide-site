"use client";
import React, { useState } from "react";
import styles from "@/styles/contact/Contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    request: "",
    fullName: "",
    orderNumber: "",
    email: "",
    subject: "",
    message: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log("Form submitted:", formData);
    // Reset form after submission
    setFormData({
      request: "",
      fullName: "",
      orderNumber: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formField}>
          <div
            className={styles.dropdown}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className={styles.selectedOption}>
              {formData.request || "How can we help you?"}
            </div>
            <div className={styles.arrow}>
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L7 7L13 1"
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {showDropdown && (
              <div className={styles.options}>
                <div
                  className={styles.option}
                  onClick={() => {
                    setFormData({ ...formData, request: "Order Status" });
                    setShowDropdown(false);
                  }}
                >
                  Order Status
                </div>
                <div
                  className={styles.option}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      request: "Returns & Exchanges",
                    });
                    setShowDropdown(false);
                  }}
                >
                  Returns & Exchanges
                </div>
                <div
                  className={styles.option}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      request: "Product Information",
                    });
                    setShowDropdown(false);
                  }}
                >
                  Product Information
                </div>
                <div
                  className={styles.option}
                  onClick={() => {
                    setFormData({ ...formData, request: "Other" });
                    setShowDropdown(false);
                  }}
                >
                  Other
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldHalf}>
            <label htmlFor="fullName">Full name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.fieldHalf}>
            <label htmlFor="orderNumber">Order number</label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className={styles.formField}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          SEND
        </button>
      </form>

      <div className={styles.divider}></div>
    </div>
  );
}
