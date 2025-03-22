// lib/shopify/products.ts

import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
} from "./queries/productQueries";
import { shopifyRequest, formatProduct, formatProductList } from "../utils";
import { ProductsResponse, ProductResponse } from "@/types/product-types";
import { storefrontClient } from "./client";

// Get multiple products
export async function getProducts(limit = 20) {
  const data = await shopifyRequest<ProductsResponse>(
    GET_PRODUCTS_QUERY,
    storefrontClient,
    { first: limit },
    "Fetching product list"
  );

  if (!data) return [];

  return formatProductList(data.products.edges);
}

// Get a single product by handle
export async function getProduct(handle: string) {
  const data = await shopifyRequest<ProductResponse>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    storefrontClient,
    { handle },
    `Fetching product details for "${handle}"`
  );

  if (!data?.productByHandle) {
    console.warn(`⚠️ Product "${handle}" not found.`);
    return null;
  }

  return formatProduct(data.productByHandle);
}
