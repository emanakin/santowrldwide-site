"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/products/AddToCartButton.module.css";
import { Product, CartItem } from "@/types/product-types";

type AddToCartButtonProps = {
  product: Product;
  selectedVariantId?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
};

export default function AddToCartButton({
  product,
  selectedVariantId,
  selectedSize,
  selectedColor,
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      console.error("No variant selected");
      return;
    }

    setIsAdding(true);

    try {
      // Find the selected variant to get its price
      const variant = product.variants.find((v) => v.id === selectedVariantId);

      if (!variant) {
        console.error("Selected variant not found");
        return;
      }

      // Create cart item
      const cartItem: CartItem = {
        id: `${selectedVariantId}-${Date.now()}`, // Temporary ID, will be replaced by Shopify
        variantId: selectedVariantId,
        quantity,
        title: product.title,
        price: variant.price,
        imageUrl: product.featuredImage?.url,
        size: selectedSize,
        color: selectedColor,
      };

      // Add to cart
      await addItem(cartItem);

      // Open cart drawer
      openCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.addToCartButton}
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariantId}
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>

      <button className={styles.wishlistButton}>♡</button>
    </div>
  );
}
