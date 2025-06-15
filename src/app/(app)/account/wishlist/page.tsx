"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import WishlistButton from "@/components/products/WishlistButton";
import styles from "@/styles/account/Wishlist.module.css";

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, clearWishlist, loading } =
    useWishlist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>My Wishlist</h1>
          <p className={styles.emptyMessage}>
            Please log in to view your wishlist.
          </p>
          <Link href="/login" className={styles.loginButton}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading wishlist...</div>
      </div>
    );
  }

  const handleClearWishlist = async () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      await clearWishlist();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Wishlist</h1>
        {wishlistCount > 0 && (
          <div className={styles.headerActions}>
            <span className={styles.count}>{wishlistCount} items</span>
            <button
              className={styles.clearButton}
              onClick={handleClearWishlist}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {wishlistCount === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>♡</div>
          <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
          <p className={styles.emptyMessage}>
            Save items you love for later. They&apos;ll appear here.
          </p>
          <Link href="/products" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {wishlistItems.map((item) => (
            <div key={item.id} className={styles.wishlistItem}>
              <Link
                href={`/products/${item.handle}`}
                className={styles.itemLink}
              >
                <div className={styles.imageContainer}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>{item.title[0]}</span>
                    </div>
                  )}
                </div>

                <div className={styles.itemInfo}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemPrice}>${item.price}</p>
                  <p className={styles.dateAdded}>
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              <div className={styles.itemActions}>
                <WishlistButton
                  product={{
                    id: item.productId,
                    handle: item.handle,
                    title: item.title,
                    price: item.price,
                    description: "",
                    currencyCode: "USD",
                    featuredImage: {
                      url: item.imageUrl,
                      altText: item.title,
                    },
                    images: {
                      edges: [
                        {
                          node: {
                            url: item.imageUrl,
                            altText: item.title,
                          },
                        },
                      ],
                    },
                  }}
                  size="small"
                />
                <Link
                  href={`/products/${item.handle}`}
                  className={styles.viewButton}
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
