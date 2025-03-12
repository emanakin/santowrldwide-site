"use client";
import React, { useState } from "react";
import styles from "@/styles/products/ShippingInfo.module.css";

export default function ShippingInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span>FREE DELIVERY for orders over FROM $100.00</span>
        <span className={`${styles.arrow} ${isExpanded ? styles.up : ""}`}>
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          <p>Fast standard shipping from Toronto, Canada.</p>
          <p>Takes usually 5-7 business days.</p>
        </div>
      )}
    </div>
  );
}
