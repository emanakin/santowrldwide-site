"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "@/styles/cart/CartPage.module.css";

export default function CartPage() {
  const { cartItems, removeItem, subtotal, tax, shipping, total } = useCart();
  const [email, setEmail] = useState("");

  // Recommendations - would be replaced with actual data in a real implementation
  const recommendations = [
    { id: 1, title: "Product 1", imageUrl: "/path/to/image1.jpg" },
    { id: 2, title: "Product 2", imageUrl: "/path/to/image2.jpg" },
    { id: 3, title: "Product 3", imageUrl: "/path/to/image3.jpg" },
    { id: 4, title: "Product 4", imageUrl: "/path/to/image4.jpg" },
  ];

  //   const recentlyViewed = [
  //     { id: 5, title: "Product 5", imageUrl: "/path/to/image5.jpg" },
  //     { id: 6, title: "Product 6", imageUrl: "/path/to/image6.jpg" },
  //     { id: 7, title: "Product 7", imageUrl: "/path/to/image7.jpg" },
  //     { id: 8, title: "Product 8", imageUrl: "/path/to/image8.jpg" },
  //   ];

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement checkout logic
    console.log("Proceeding to checkout with email:", email);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cartPageContainer}>
        <div className={styles.cartSection}>
          <h1 className={styles.heading}>SHOPPING BAG</h1>

          <div className={styles.cartHeader}>
            <div className={styles.itemColumn}>ITEM</div>
            <div className={styles.totalColumn}>TOTAL</div>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your shopping bag is empty</p>
              <Link href="/products" className={styles.continueShoppingLink}>
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemImage}>
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={100}
                          height={120}
                          objectFit="cover"
                        />
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      {item.color && item.size && (
                        <p className={styles.itemVariant}>
                          SIZE: {item.size} {item.color && `- ${item.color}`}
                        </p>
                      )}
                      <button
                        className={styles.removeButton}
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    ${parseFloat(item.price).toFixed(2)} CAD
                  </div>
                </div>
              ))}

              <div className={styles.cartSummary}>
                <div className={styles.summaryLine}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Tax / GST</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Shipping estimate</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className={styles.orderTotal}>
                  <span>Order Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.checkoutSection}>
          <h2 className={styles.checkoutHeading}>CHECKOUT</h2>
          <p className={styles.checkoutText}>
            Enter your email to login or continue to checkout
          </p>
          <form onSubmit={handleProceedToCheckout}>
            <div className={styles.emailField}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.checkoutButton}>
              PROCEED TO CHECKOUT
            </button>
          </form>
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className={styles.recommendations}>
          <div className={styles.recommendationTabs}>
            <div className={styles.tabActive}>YOU MAY ALSO LIKE</div>
            <div className={styles.tab}>RECENTLY VIEWED</div>
          </div>

          <div className={styles.recommendationProducts}>
            {recommendations.map((product) => (
              <div key={product.id} className={styles.recommendedProduct}>
                <div className={styles.recommendedProductImage}>
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={150}
                    height={180}
                    objectFit="cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
