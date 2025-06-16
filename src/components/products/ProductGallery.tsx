"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import styles from "../../styles/products/ProductGallery.module.css";

type ProductGalleryProps = {
  images: Array<{
    url: string;
    altText?: string;
  }>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
};

export default function ProductGallery({
  images,
  activeIndex,
}: ProductGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Scroll to active image within gallery container only
  useEffect(() => {
    if (galleryRef.current) {
      const imageElements = galleryRef.current.querySelectorAll(
        `.${styles.imageWrapper}`
      );
      if (imageElements && imageElements[activeIndex]) {
        // Scroll within the gallery container only, don't affect page scroll
        const galleryContainer = galleryRef.current;
        const targetImage = imageElements[activeIndex] as HTMLElement;

        if (galleryContainer && targetImage) {
          const containerRect = galleryContainer.getBoundingClientRect();
          const imageRect = targetImage.getBoundingClientRect();

          // Only scroll if the image is outside the visible area of the container
          if (
            imageRect.top < containerRect.top ||
            imageRect.bottom > containerRect.bottom
          ) {
            targetImage.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }
        }
      }
    }
  }, [activeIndex]);

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.gallery} ref={galleryRef}>
        {images.map((image, index) => (
          <div key={index} className={styles.imageWrapper}>
            <Image
              src={image.url}
              alt={image.altText || "Product image"}
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              priority={index === 0}
              style={{ objectFit: "contain" }}
              quality={90}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
