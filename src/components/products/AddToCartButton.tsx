"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
// import { useRouter } from "next/navigation";
import WishlistButton from "./WishlistButton";
import styles from "@/styles/products/AddToCartButton.module.css";
import { Product, CartItem } from "@/types/product-types";

type AddToCartButtonProps = {
  product: Product;
  selectedVariantId?: string | null;
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
  // const router = useRouter();

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

      // Check if variant is available
      if (!variant.availableForSale) {
        console.error("Selected variant is not available for sale");
        return;
      }

      // Create cart item
      const cartItem: CartItem = {
        id: `${selectedVariantId}-${Date.now()}`, // Temporary ID, will be replaced by Shopify
        variantId: selectedVariantId,
        quantity,
        title: product.title,
        price: variant.price,
        imageUrl: product.images?.[0]?.url,
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

  // Check if the selected variant is available
  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );
  const isVariantAvailable = selectedVariant?.availableForSale ?? false;

  return (
    <div className={styles.container}>
      <button
        className={styles.addToCartButton}
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariantId || !isVariantAvailable}
      >
        {isAdding
          ? "Adding..."
          : !selectedVariantId
            ? "Select Options"
            : !isVariantAvailable
              ? "Out of Stock"
              : "Add to Cart"}
      </button>

      <WishlistButton product={product} size="medium" />
    </div>
  );
}
