"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "./WishlistButton";
import styles from "@/styles/products/ProductCard.module.css";
import { ProductCardProps } from "@/types/product-types";

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get available images
  const images = product.images?.edges || [];
  const hasMultipleImages = images.length > 1;

  // Transform product for WishlistButton - using handle as consistent identifier
  const wishlistProduct = {
    id: product.handle, // Use handle as ID for consistency
    handle: product.handle,
    title: product.title,
    price: product.price,
    description: "",
    currencyCode: "USD",
    featuredImage: product.featuredImage,
    images: product.images,
  };

  // Get current image to display
  const getCurrentImage = () => {
    if (imgError || !hasMultipleImages) {
      return product.featuredImage;
    }
    return images[currentImageIndex]?.node || product.featuredImage;
  };

  // Handle mouse enter to start cycling
  const handleMouseEnter = () => {
    if (hasMultipleImages && !imgError) {
      setCurrentImageIndex(1); // Show second image
    }
  };

  // Handle mouse leave to reset to first image
  const handleMouseLeave = () => {
    if (hasMultipleImages && !imgError) {
      setCurrentImageIndex(0); // Back to first image
    }
  };

  // Handle mouse move for additional image cycling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasMultipleImages || imgError) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const imageIndex = Math.min(
      Math.floor((x / width) * images.length),
      images.length - 1
    );
    setCurrentImageIndex(imageIndex);
  };

  const currentImage = getCurrentImage();

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.handle}`} className={styles.cardLink}>
        <div
          className={styles.imageContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {!imgError ? (
            <Image
              src={currentImage.url}
              alt={currentImage.altText || product.title}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              style={{ objectFit: "contain" }}
              onError={() => setImgError(true)}
              priority
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>{product.title[0]}</span>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.productDetails}>
            <h3 className={styles.title}>{product.title}</h3>
            <p className={styles.price}>${product.price}</p>
          </div>
        </div>
      </Link>

      <div className={styles.cardActions}>
        <WishlistButton
          product={wishlistProduct}
          size="small"
          className={styles.wishlistBtn}
        />
      </div>
    </div>
  );
}
