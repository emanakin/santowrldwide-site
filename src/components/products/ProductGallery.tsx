"use client";
import React, { useState } from "react";
import Image from "next/image";
import styles from "@/styles/products/ProductGallery.module.css";

type ProductGalleryProps = {
  images: Array<{
    url: string;
    altText?: string;
  }>;
};

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].altText || "Product image"}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          priority
          style={{ objectFit: "contain" }}
        />
      </div>

      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${styles.thumbnail} ${
              selectedImage === index ? styles.active : ""
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image.url}
              alt={image.altText || "Product thumbnail"}
              width={80}
              height={80}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
