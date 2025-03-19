"use client";
import React, { useEffect } from "react";
import styles from "@/styles/products/DeliveryReturnsPopup.module.css";

type DeliveryReturnsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DeliveryReturnsPopup({
  isOpen,
  onClose,
}: DeliveryReturnsPopupProps) {
  // Handle ESC key to close the popup
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.content}>
          <h2>FREE DELIVERY & RETURNS</h2>

          <div className={styles.section}>
            <h3>Shipping Policy</h3>
            <p>Estimated delivery time for Toronto, Canada:</p>
            <ul>
              <li>Standard Shipping: 3-5 business days</li>
              <li>Express Shipping: 1-2 business days (additional fee)</li>
            </ul>
            <p>Free standard shipping on all orders over $100.</p>
          </div>

          <div className={styles.section}>
            <h3>Return Policy</h3>
            <p>
              We accept returns within 30 days of purchase for a full refund.
            </p>
            <p>
              Items must be unworn, unwashed, and with all original tags
              attached.
            </p>
            <p>To initiate a return:</p>
            <ol>
              <li>Log into your account or contact our customer service</li>
              <li>Select the items you wish to return</li>
              <li>Print your return label and return authorization</li>
              <li>Drop off your package at any postal location</li>
            </ol>
          </div>

          <div className={styles.section}>
            <h3>Customer Support</h3>
            <p>
              For any questions about delivery or returns, please contact us:
            </p>
            <p>Email: support@santowrldwide.com</p>
            <p>Phone: 416-123-4567</p>
            <p>Hours: Monday-Friday, 9am-5pm EST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
