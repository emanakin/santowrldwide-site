"use client";
import CartDrawer from "@/components/cart/CartDrawer";
import React, { createContext, useContext, useState, useEffect } from "react";

type CartItem = {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  price: string;
  imageUrl?: string;
  size?: string;
  color?: string;
};

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

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.13; // Assuming 13% tax rate
  const shipping = 10.0; // Default shipping cost
  const total = subtotal + tax + shipping;

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setCartCount(
          parsedCart.reduce(
            (total: number, item: CartItem) => total + item.quantity,
            0
          )
        );
      } catch (error) {
        console.error("Error parsing cart data from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    setCartCount(cartItems.reduce((total, item) => total + item.quantity, 0));
  }, [cartItems]);

  // Cart functions
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Add an item to the cart
  const addItem = (newItem: CartItem) => {
    setLoading(true);
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.variantId === newItem.variantId &&
          item.size === newItem.size &&
          item.color === newItem.color
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, newItem];
      }
    });
    setLoading(false);
  };

  // Remove an item from the cart
  const removeItem = (itemId: string) => {
    setLoading(true);
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    setLoading(false);
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setLoading(true);
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
    setLoading(false);
  };

  const clearCart = () => {
    setCartItems([]);
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
