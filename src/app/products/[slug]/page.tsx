import React from "react";
import ProductGallery from "@/components/products/ProductGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductOptions from "@/components/products/ProductOptions";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductDescription from "@/components/products/ProductDescription";
import ShippingInfo from "@/components/products/ShippingInfo";
import Breadcrumb from "@/components/products/Breadcrumb";
import { getProduct } from "@/lib/shopify";
import styles from "@/styles/products/ProductDetail.module.css";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params?.slug) {
    return notFound();
  }

  const slug = params.slug;
  // Fetch product data from Shopify
  const product = await getProduct(slug);

  if (!product) {
    return notFound();
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "Products", url: "/products" },
          { label: product.title },
        ]}
      />

      <div className={styles.productContent}>
        <div className={styles.productGalleryColumn}>
          <ProductGallery images={product.images} />
        </div>

        <div className={styles.productInfoColumn}>
          <ProductInfo title={product.title} price={product.price} />

          <ProductOptions
            variants={product.variants}
            options={product.options}
          />

          <AddToCartButton product={product} />

          <ShippingInfo />

          <ProductDescription description={product.description} />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.title,
    description: product.description,
  };
}
