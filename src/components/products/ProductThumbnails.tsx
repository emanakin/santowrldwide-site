"use client";
import React from "react";
import Image from "next/image";
import styles from "@/styles/products/ProductThumbnails.module.css";

type ProductThumbnailsProps = {
  images: Array<{
    url: string;
    altText?: string;
  }>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

export default function ProductThumbnails({
  images,
  activeIndex,
  setActiveIndex,
}: ProductThumbnailsProps) {
  // Function to handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);

    // Find the gallery element and scroll to the selected image
    const gallery = document.querySelector(`.gallery`);
    const imageElements = gallery?.querySelectorAll(`.imageWrapper`);

    if (imageElements && imageElements[index]) {
      imageElements[index].scrollIntoView({ block: "start" });
    }
  };

  return (
    <div className={styles.thumbnails}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`${styles.thumbnail} ${
            activeIndex === index ? styles.active : ""
          }`}
          onClick={() => handleThumbnailClick(index)}
        >
          <Image
            src={image.url}
            alt={image.altText || "Product thumbnail"}
            fill
            sizes="60px"
            style={{ objectFit: "contain" }}
          />
        </div>
      ))}
    </div>
  );
}
