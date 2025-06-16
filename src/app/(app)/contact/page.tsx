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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear any previous status messages when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            data.message ||
            "Thank you for your message. We'll get back to you soon!",
        });

        // Reset form after successful submission
        setFormData({
          request: "",
          fullName: "",
          orderNumber: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Status Messages */}
        {submitStatus.type && (
          <div
            className={`${styles.statusMessage} ${styles[submitStatus.type]}`}
          >
            {submitStatus.message}
          </div>
        )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !formData.request}
        >
          {isSubmitting ? "SENDING..." : "SEND"}
        </button>
      </form>

      <div className={styles.divider}></div>
    </div>
  );
}
