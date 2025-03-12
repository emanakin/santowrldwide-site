import React from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Breadcrumb from "@/components/products/Breadcrumb";
import { getProducts } from "@/lib/shopify";
import styles from "@/styles/products/Products.module.css";

// Fallback data in case the API fails
const fallbackProducts = [
  {
    id: "1",
    handle: "v-turning-top",
    title: "V TURNING TOP",
    featuredImage: {
      url: "/images/products/placeholder.png",
      altText: "V Turning Top",
    },
    price: "150.00",
  },
  {
    id: "2",
    handle: "santo-tee",
    title: "SANTO TEE",
    featuredImage: {
      url: "/images/products/placeholder.png",
      altText: "Santo Tee",
    },
    price: "120.00",
  },
];

export default async function ProductsPage() {
  let products;

  try {
    products = await getProducts();
    // If the API returns an empty array, use fallback data
    if (!products || products.length === 0) {
      console.log("No products returned from API, using fallback data");
      products = fallbackProducts;
    }
  } catch (error) {
    console.error("Error in ProductsPage:", error);
    products = fallbackProducts;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "SW2025 Drop", url: "/products" },
          { label: "2023S-09-34" },
        ]}
      />
      <div className={styles.headerRow}>
        <div className={styles.itemCount}>{products.length} items</div>
        <button className={styles.filterButton}>FILTER</button>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
