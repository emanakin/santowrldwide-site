"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import styles from "@/styles/cart/CartDrawer.module.css";
import Image from "next/image";

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartCount,
    removeItem,
    updateItemQuantity,
    loading,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeCart}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Bag ({cartCount})</h2>
          <button className={styles.closeButton} onClick={closeCart}>
            ×
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Your bag is empty</p>
            <Link
              href="/products"
              className={styles.shopButton}
              onClick={closeCart}
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.item}>
                  {item.imageUrl && (
                    <div className={styles.itemImage}>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={80}
                        height={80}
                        objectFit="cover"
                      />
                    </div>
                  )}
                  <div className={styles.itemInfo}>
                    <h3>{item.title}</h3>
                    <p>${item.price}</p>
                    <div className={styles.quantityControl}>
                      <button
                        disabled={loading}
                        onClick={() =>
                          updateItemQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        disabled={loading}
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <span>
                $
                {cartItems
                  .reduce(
                    (total, item) =>
                      total + parseFloat(item.price) * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className={styles.actions}>
              <Link
                href="/checkout"
                className={styles.checkoutButton}
                onClick={closeCart}
              >
                CHECKOUT
              </Link>
              <button className={styles.continueButton} onClick={closeCart}>
                CONTINUE SHOPPING
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
