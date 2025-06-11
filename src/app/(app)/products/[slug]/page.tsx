"use client";
import React, { useState, useEffect } from "react";
import ProductGallery from "@/components/products/ProductGallery";
import ProductThumbnails from "@/components/products/ProductThumbnails";
import ProductInfo from "@/components/products/ProductInfo";
import ProductOptions from "@/components/products/ProductOptions";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductDescription from "@/components/products/ProductDescription";
import ShippingInfo from "@/components/products/ShippingInfo";
import Breadcrumb from "@/components/products/Breadcrumb";
import { getProduct } from "@/lib/shopify/products";
import styles from "@/styles/products/ProductDetail.module.css";
import { useParams } from "next/navigation";
import { Product } from "@/types/product-types";

export default function ProductPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  const params = useParams();
  const slug = params.slug as string;

  const product = useProduct(slug);

  useEffect(() => {
    if (!product?.variants || !product?.options) return;

    if (
      Object.keys(selectedOptions).length === 0 &&
      product.variants.length > 0
    ) {
      const firstVariant = product.variants.find((v) => v.availableForSale);
      if (firstVariant) {
        setSelectedVariantId(firstVariant.id);
        const initialOptions: Record<string, string> = {};
        firstVariant.selectedOptions.forEach((option) => {
          initialOptions[option.name] = option.value;
        });
        setSelectedOptions(initialOptions);
      }
      return;
    }

    const matchingVariant = product.variants.find((variant) => {
      return variant.selectedOptions.every(
        (option) => selectedOptions[option.name] === option.value
      );
    });

    setSelectedVariantId(matchingVariant?.id || null);
  }, [selectedOptions, product]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "SW2025 Drop", url: "/products" },
          { label: product.title },
        ]}
      />

      <div className={styles.productContent}>
        <div className={styles.productInfoColumn}>
          <ProductThumbnails
            images={product.images}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />

          <ProductInfo title={product.title} price={product.price} />

          <ProductOptions
            variants={product.variants}
            options={product.options}
            selectedOptions={selectedOptions}
            onOptionChange={setSelectedOptions}
          />

          <AddToCartButton
            product={product}
            selectedVariantId={selectedVariantId}
            selectedSize={selectedOptions.Size}
            selectedColor={selectedOptions.Color}
          />

          <ShippingInfo />

          <ProductDescription description={product.description} />
        </div>

        <div className={styles.productGalleryColumn}>
          <ProductGallery
            images={product.images}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
}

// Simulated data hook (in a real app, you'd use SWR or React Query)
function useProduct(slug: string) {
  const [product, setProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(slug);
        setProduct(data as unknown as Product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    fetchProduct();
  }, [slug]);

  return product;
}

// Fix the metadata function to properly await params
// export async function generateMetadata({ params }: ProductPageProps) {
//   // Await the params before accessing slug
//   const resolvedParams = await params;
//   const product = await getProduct(resolvedParams.slug);

//   if (!product) {
//     return {
//       title: "Product Not Found",
//     };
//   }

//   return {
//     title: product.title,
//     description: product.description,
//   };
// }
