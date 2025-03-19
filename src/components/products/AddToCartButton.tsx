"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/products/AddToCartButton.module.css";
import { Product, CartItem } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariant] = useState(product.variants[0]?.id);
  const [selectedSize] = useState("Medium");
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    try {
      addItem({
        id: Math.random().toString(36).substring(2, 9), // Generate a simple unique ID
        variantId: selectedVariant,
        quantity: 1,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        size: selectedSize,
      } as CartItem);

      // Navigate to cart page
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
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
