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
    images: {
      edges: {
        node: {
          url: string;
          altText?: string;
        };
      }[];
    };
  }>;
};

export default function ProductGrid({ products }: ProductGridProps) {
  // Example of preprocessing product data before passing to ProductGrid
  const processedProducts = products.map((product) => ({
    ...product,
    images: {
      edges: product.images.edges.map((edge) => ({
        node: {
          ...edge.node,
          // Ensure altText exists
          altText: edge.node.altText || "",
        },
      })),
    },
  }));
  return (
    <div className={styles.grid}>
      {products && products.length > 0 ? (
        processedProducts.map((product, index) => (
          <ProductCard key={product.handle || index} product={product} />
        ))
      ) : (
        <div className={styles.noProducts}>No products found</div>
      )}
    </div>
  );
}
