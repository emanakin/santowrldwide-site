"use client";
import CartDrawer from "@/components/cart/CartDrawer";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createCart,
  addCartItems,
  updateCartItems,
  removeCartItems,
  updateCartBuyerIdentity,
  getCart,
  shopifyCartToLocalCart,
} from "@/lib/shopify/cart";
import { CartItem } from "@/types/product-types";
import { STORE_PAUSED } from "@/lib/storeStatus";

export interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  loading: boolean;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  initiateCheckout: () => Promise<string>; // Returns checkout URL
  cartId: string | null;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartId, setCartId] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping] = useState(10.0); // Default shipping cost
  const [total, setTotal] = useState(0);
  const [needsSync, setNeedsSync] = useState(false);

  // Get auth context
  const { user } = useAuth();

  // Initialize cart or load from storage
  useEffect(() => {
    const loadCart = async () => {
      // Don't hit Shopify while the drop is paused — the shop is sold out
      if (STORE_PAUSED) {
        setCartItems([]);
        setSubtotal(0);
        setTax(0);
        setTotal(0);
        setCartCount(0);
        return;
      }

      // Try to load cart ID from localStorage
      const storedCartId = localStorage.getItem("cartId");

      if (storedCartId) {
        try {
          // Try to fetch the cart from Shopify
          const shopifyCart = await getCart(storedCartId);

          if (shopifyCart) {
            setCartId(storedCartId);
            // Convert Shopify cart to our local format
            const localCart = shopifyCartToLocalCart(shopifyCart);
            setCartItems(localCart.items);
            setSubtotal(localCart.subtotal);
            setTax(localCart.tax);
            setTotal(localCart.total + shipping);
            setCartCount(
              localCart.items.reduce((sum, item) => sum + item.quantity, 0)
            );
            return;
          }
        } catch (error) {
          console.error("Error loading cart from Shopify:", error);
        }
      }

      // If we don't have a valid cart in Shopify, create a new one
      try {
        const newCart = await createCart();
        setCartId(newCart.id);
        localStorage.setItem("cartId", newCart.id);
        setCartItems([]);
        setSubtotal(0);
        setTax(0);
        setTotal(shipping);
        setCartCount(0);
      } catch (error) {
        console.error("Error creating new cart:", error);
      }
    };

    loadCart();
  }, [shipping]);

  // When user changes, we may need to associate the cart with the user
  useEffect(() => {
    const associateCartWithUser = async () => {
      if (user && cartId) {
        try {
          setLoading(true);
          // Here we would get the user's customer access token
          // This is just a placeholder - implement your actual token retrieval
          const customerAccessToken = await getCustomerAccessToken();

          if (customerAccessToken) {
            await updateCartBuyerIdentity(
              cartId,
              user.email || "",
              customerAccessToken
            );
          } else {
            // Even without a token, we can at least set the email
            await updateCartBuyerIdentity(cartId, user.email || "");
          }
        } catch (error) {
          console.error("Error associating cart with user:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    associateCartWithUser();
  }, [user, cartId]);

  // Sync local cart with Shopify cart when needed
  useEffect(() => {
    if (needsSync && cartId) {
      const syncCartWithShopify = async () => {
        try {
          setLoading(true);
          const shopifyCart = await getCart(cartId);
          if (shopifyCart) {
            const localCart = shopifyCartToLocalCart(shopifyCart);
            setCartItems(localCart.items);
            setSubtotal(localCart.subtotal);
            setTax(localCart.tax);
            setTotal(localCart.total + shipping);
            setCartCount(
              localCart.items.reduce((sum, item) => sum + item.quantity, 0)
            );
          }
        } catch (error) {
          console.error("Error syncing cart with Shopify:", error);
        } finally {
          setLoading(false);
          setNeedsSync(false);
        }
      };

      syncCartWithShopify();
    }
  }, [needsSync, cartId, shipping]);

  // Placeholder function for getting customer access token
  const getCustomerAccessToken = async (): Promise<string | null> => {
    // In a real implementation, this would fetch the token from cookies or API
    // For now, just return null (implement this based on your auth system)
    return null;
  };

  // Cart functions
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Add an item to the cart
  const addItem = async (newItem: CartItem) => {
    if (STORE_PAUSED) return;
    if (!cartId) return;

    setLoading(true);
    try {
      // First check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.variantId === newItem.variantId
      );

      if (existingItemIndex >= 0) {
        // If item exists, update its quantity
        const existingItem = cartItems[existingItemIndex];
        const lineId = existingItem.id;
        const newQuantity = existingItem.quantity + newItem.quantity;

        await updateCartItems(cartId, [{ lineId, quantity: newQuantity }]);
      } else {
        // Item doesn't exist, add it to cart
        await addCartItems(cartId, [newItem]);
      }

      // Set flag to sync cart from Shopify
      setNeedsSync(true);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove an item from the cart
  const removeItem = async (itemId: string) => {
    if (!cartId) return;

    setLoading(true);
    try {
      await removeCartItems(cartId, [itemId]);
      // Set flag to sync cart from Shopify
      setNeedsSync(true);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (!cartId) return;

    setLoading(true);
    try {
      if (quantity <= 0) {
        await removeCartItems(cartId, [itemId]);
      } else {
        await updateCartItems(cartId, [{ lineId: itemId, quantity }]);
      }
      // Set flag to sync cart from Shopify
      setNeedsSync(true);
    } catch (error) {
      console.error("Error updating item quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!cartId) return;

    setLoading(true);
    try {
      // Create a new empty cart
      const newCart = await createCart();
      setCartId(newCart.id);
      localStorage.setItem("cartId", newCart.id);
      setCartItems([]);
      setSubtotal(0);
      setTax(0);
      setTotal(shipping);
      setCartCount(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initiate checkout process
  const initiateCheckout = async (): Promise<string> => {
    if (STORE_PAUSED) {
      throw new Error("This drop is sold out.");
    }
    if (!cartId) {
      throw new Error("No cart available for checkout");
    }

    try {
      // Get the latest cart data which includes the checkout URL
      const cart = await getCart(cartId);

      if (!cart?.checkoutUrl) {
        throw new Error("Checkout URL not available");
      }

      return cart.checkoutUrl;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      throw error;
    }
  };

  // Provide the context value
  const contextValue: CartContextType = {
    cartItems,
    cartCount,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    loading,
    subtotal,
    tax,
    shipping,
    total,
    initiateCheckout,
    cartId,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
      {isCartOpen && <CartDrawer />}
    </CartContext.Provider>
  );
};

// Hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
