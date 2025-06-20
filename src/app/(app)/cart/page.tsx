"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/cart/CartPage.module.css";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/shopify/products";
import { ProductListItem } from "@/types/product-types";

export default function CartPage() {
  const { cartItems, removeItem, subtotal, tax, shipping, total } = useCart();
  const { user, setShowLoginPanel, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [recommendations, setRecommendations] = useState<ProductListItem[]>([]);
  const router = useRouter();

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Fetch actual product recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const products = await getProducts(8);
        setRecommendations(products);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, []);

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    if (!user && false) {
      setShowLoginPanel(true);
    } else {
      router.push("/checkout");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cartPageContainer}>
        <div className={styles.cartSection}>
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
                          width={80}
                          height={100}
                          style={{
                            objectFit: "contain",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </div>
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      {(item.size || item.color) && (
                        <p className={styles.itemVariant}>
                          {item.size && `SIZE: ${item.size}`}
                          {item.size && item.color && " - "}
                          {item.color && item.color}
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
                  <span>Estimated Tax</span>
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
          {user ? (
            <div>
              <p className={styles.checkoutText}>
                Logged in as {user.displayName || user.email}
              </p>
              <button
                onClick={handleProceedToCheckout}
                className={styles.checkoutButton}
                disabled={cartItems.length === 0}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          ) : (
            <>
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
                <button
                  type="submit"
                  className={styles.checkoutButton}
                  disabled={cartItems.length === 0}
                >
                  PROCEED TO CHECKOUT
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {cartItems.length > 0 && (
        <div className={styles.recommendations}>
          <div className={styles.recommendationTabs}>
            <div className={styles.tabActive}>YOU MAY ALSO LIKE</div>
          </div>

          <div className={styles.recommendationProducts}>
            {recommendations.length > 0 ? (
              recommendations.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className={styles.recommendedProduct}
                >
                  <div className={styles.recommendedProductImage}>
                    <Image
                      src={
                        product.featuredImage.url || "/images/placeholder.png"
                      }
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 480px) 120px, (max-width: 768px) 140px, 180px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className={styles.recommendedProductInfo}>
                    <h4 className={styles.recommendedProductTitle}>
                      {product.title}
                    </h4>
                    <p className={styles.recommendedProductPrice}>
                      ${product.price}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.noRecommendations}>
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
