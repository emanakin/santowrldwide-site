"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product, ProductListItem } from "@/types/product-types";

export interface WishlistItem {
  id: string;
  productId: string;
  handle: string;
  title: string;
  price: string;
  imageUrl: string;
  dateAdded: string;
}

export interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (product: Product | ProductListItem) => Promise<void>;
  removeFromWishlist: (productHandle: string) => Promise<void>;
  isInWishlist: (productHandle: string) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load wishlist from localStorage on mount and when user changes
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const storageKey = user?.id ? `wishlist_${user.id}` : "wishlist_guest";
        const storedWishlist = localStorage.getItem(storageKey);

        if (storedWishlist) {
          const parsed = JSON.parse(storedWishlist);
          setWishlistItems(parsed);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlistItems([]);
      }
    };

    loadWishlist();
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const saveWishlist = () => {
      try {
        const storageKey = user?.id ? `wishlist_${user.id}` : "wishlist_guest";
        localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
      } catch (error) {
        console.error("Error saving wishlist:", error);
      }
    };

    saveWishlist();
  }, [wishlistItems, user]);

  const getProductImageUrl = (product: Product | ProductListItem): string => {
    // Handle Product type
    if ("images" in product && Array.isArray(product.images)) {
      return product.images[0]?.url || "";
    }
    // Handle ProductListItem type
    if ("featuredImage" in product && product.featuredImage) {
      return product.featuredImage.url || "";
    }
    return "";
  };

  const addToWishlist = async (product: Product | ProductListItem) => {
    setLoading(true);
    try {
      // Use handle as the consistent identifier
      const productHandle = product.handle;

      // Check if item already exists
      if (isInWishlist(productHandle)) {
        return;
      }

      // Create wishlist item
      const wishlistItem: WishlistItem = {
        id: `${productHandle}_${Date.now()}`,
        productId: product.id,
        handle: productHandle,
        title: product.title,
        price: product.price,
        imageUrl: getProductImageUrl(product),
        dateAdded: new Date().toISOString(),
      };

      setWishlistItems((prev) => [wishlistItem, ...prev]);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productHandle: string) => {
    setLoading(true);
    try {
      setWishlistItems((prev) =>
        prev.filter((item) => item.handle !== productHandle)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productHandle: string): boolean => {
    return wishlistItems.some((item) => item.handle === productHandle);
  };

  const clearWishlist = async () => {
    setLoading(true);
    try {
      setWishlistItems([]);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: WishlistContextType = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loading,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
