"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/checkout/Checkout.module.css";
import Link from "next/link";
import { updateCartBuyerIdentity } from "@/lib/shopify/cart";
import { STORE_PAUSED, SOLD_OUT_MESSAGE } from "@/lib/storeStatus";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    subtotal,
    tax,
    shipping,
    total,
    initiateCheckout,
    loading,
    cartId,
  } = useCart();
  const { user, setShowLoginPanel } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (STORE_PAUSED) return;

    // If cart is empty, redirect to cart page
    if (cartItems.length === 0) {
      router.push("/cart");
    }

    // If user is logged in, pre-fill email
    if (user?.email) {
      setEmail(user.email);
    }
  }, [cartItems.length, router, user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // If we have a cart ID and an email (guest or user), update the cart with buyer identity
      if (cartId && email) {
        // Get customer access token if user is logged in
        const customerAccessToken = user
          ? await getCustomerAccessToken()
          : null;

        // Update cart with buyer identity
        await updateCartBuyerIdentity(
          cartId,
          email,
          customerAccessToken || undefined
        );
      }

      // Get the checkout URL from Shopify
      const checkoutUrl = await initiateCheckout();

      // Redirect to the Shopify checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        "There was a problem processing your checkout. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    setShowLoginPanel(true);
  };

  // Placeholder for getting customer token
  const getCustomerAccessToken = async (): Promise<string | null> => {
    // In a real implementation, this would fetch the token from a cookie or API
    // For example, you might do something like:
    // const response = await fetch('/api/auth/get-shopify-token');
    // const data = await response.json();
    // return data.token;

    // For now, return null
    return null;
  };

  if (STORE_PAUSED) {
    return (
      <div className={styles.checkoutContainer}>
        <h1 className={styles.checkoutTitle}>Checkout</h1>
        <p>{SOLD_OUT_MESSAGE}</p>
        <Link href="/products">View archive</Link>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>Checkout</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.checkoutContent}>
        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>

          <div className={styles.orderItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div className={styles.orderItemInfo}>
                  <p className={styles.orderItemTitle}>{item.title}</p>
                  {item.size && (
                    <p className={styles.orderItemVariant}>
                      Size: {item.size} {item.color && `- ${item.color}`}
                    </p>
                  )}
                  <p className={styles.orderItemQuantity}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className={styles.orderItemPrice}>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.orderTotals}>
            <div className={styles.orderTotalLine}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.orderTotalLine}>
              <span>Estimated Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className={styles.orderTotalLine}>
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className={styles.orderTotalFinal}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.checkoutForm}>
          {!user ? (
            <div className={styles.accountOptions}>
              <h2>Account Options</h2>
              <div className={styles.accountButtonsContainer}>
                <button className={styles.loginButton} onClick={handleLogin}>
                  Login
                </button>
                <div className={styles.orDivider}>OR</div>
                <button
                  className={styles.guestCheckoutButton}
                  onClick={() => setEmail("")}
                >
                  Continue as Guest
                </button>
              </div>

              {!user && (
                <form onSubmit={handleCheckout} className={styles.guestForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className={styles.userInfo}>
              <h2>Your Information</h2>
              <p className={styles.userEmail}>Email: {user.email}</p>
            </div>
          )}

          <button
            className={styles.proceedButton}
            onClick={handleCheckout}
            disabled={isProcessing || loading}
          >
            {isProcessing ? "Processing..." : "Proceed to Checkout"}
          </button>

          <Link href="/cart" className={styles.backToCartLink}>
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
