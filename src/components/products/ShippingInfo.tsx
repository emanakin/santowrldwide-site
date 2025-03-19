"use client";
import React, { useState } from "react";
import styles from "@/styles/products/ShippingInfo.module.css";
import DeliveryReturnsPopup from "./DeliveryReturnsPopup";

export default function ShippingInfo() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <>
      <div className={styles.container}>
        <button onClick={togglePopup} className={styles.shippingButton}>
          <div className={styles.shippingInfo}>
            <div className={styles.title}>123 DELIVERY & RETURNS</div>
            <div className={styles.subtitle}>
              Estimated delivery time for Toronto, Canada
            </div>
          </div>
          <div className={styles.expandIcon}>›</div>
        </button>
      </div>

      <DeliveryReturnsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}
