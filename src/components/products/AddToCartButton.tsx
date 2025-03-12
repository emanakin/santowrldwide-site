"use client";
import React, { useState } from "react";
import { addToCart } from "@/lib/shopify/cart";
import styles from "@/styles/products/AddToCartButton.module.css";

type AddToCartButtonProps = {
  product: {
    id: string;
    variants: Array<{
      id: string;
      title: string;
      price: string;
    }>;
  };
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariant] = useState(product.variants[0]?.id);
  const [quantity] = useState(1);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    try {
      await addToCart({
        variantId: selectedVariant,
        quantity,
      });
      // Show success message or update cart count
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.addToCartButton}
        onClick={handleAddToCart}
        disabled={isLoading}
      >
        {isLoading ? "ADDING..." : "ADD TO BAG"}
      </button>

      <button className={styles.wishlistButton}>♡</button>
    </div>
  );
}
