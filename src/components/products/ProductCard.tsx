"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/products/ProductCard.module.css";

type ProductCardProps = {
  product: {
    handle: string;
    title: string;
    featuredImage: {
      url: string;
      altText: string;
    };
    price: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  // Add error handling for image loading
  const [imgError, setImgError] = React.useState(false);

  return (
    <Link href={`/products/${product.handle}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {!imgError ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: "cover" }}
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
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.price}>${product.price}</p>
      </div>
    </Link>
  );
}
