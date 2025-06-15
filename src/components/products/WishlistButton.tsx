"use client";
import React, { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { Product, ProductListItem } from "@/types/product-types";
import styles from "@/styles/products/WishlistButton.module.css";

interface WishlistButtonProps {
  product: Product | ProductListItem;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function WishlistButton({
  product,
  size = "medium",
  className = "",
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist, loading } =
    useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const inWishlist = isInWishlist(product.handle);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      if (inWishlist) {
        await removeFromWishlist(product.handle);
      } else {
        // Add animation
        setIsAnimating(true);
        await addToWishlist(product);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      // Reset animation after 500ms
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
  };

  return (
    <button
      className={`
        ${styles.wishlistButton} 
        ${styles[size]} 
        ${inWishlist ? styles.active : ""} 
        ${isAnimating ? styles.animating : ""} 
        ${loading ? styles.loading : ""}
        ${className}
      `}
      onClick={handleWishlistToggle}
      disabled={loading}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <div className={styles.iconContainer}>
        <svg
          className={styles.heartIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {/* Floating hearts animation */}
        {isAnimating && !inWishlist && (
          <div className={styles.floatingHearts}>
            {[...Array(3)].map((_, i) => (
              <svg
                key={i}
                className={`${styles.floatingHeart} ${styles[`heart${i + 1}`]}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
