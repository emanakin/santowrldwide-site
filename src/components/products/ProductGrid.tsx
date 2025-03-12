import React from "react";
import ProductCard from "./ProductCard";
import styles from "@/styles/products/ProductGrid.module.css";

type ProductGridProps = {
  products: Array<{
    handle: string;
    title: string;
    featuredImage: {
      url: string;
      altText: string;
    };
    price: string;
  }>;
};

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className={styles.grid}>
      {products && products.length > 0 ? (
        products.map((product, index) => (
          <ProductCard key={product.handle || index} product={product} />
        ))
      ) : (
        <div className={styles.noProducts}>No products found</div>
      )}
    </div>
  );
}
