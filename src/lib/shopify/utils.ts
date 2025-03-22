import { GraphQLClient } from "graphql-request";
import { ShopifyProduct, ProductsResponse } from "@/types/product-types";

export async function shopifyRequest<T>(
  query: string,
  client: GraphQLClient,
  variables?: Record<string, unknown>,
  description = "Shopify request"
): Promise<T | null> {
  try {
    console.log(`${description} started.`);
    const data = await client.request<T>(query, variables);
    console.log(`${description} successful.`);
    return data;
  } catch (error) {
    console.error(`${description} failed: ${error}`);
    return null;
  }
}

export function formatProductList(
  edges: ProductsResponse["products"]["edges"]
) {
  return edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    price: parseFloat(node.priceRange.minVariantPrice.amount).toFixed(2),
    currencyCode: node.priceRange.minVariantPrice.currencyCode,
    featuredImage: {
      url: node.images.edges[0]?.node.url || "/placeholder.png",
      altText: node.images.edges[0]?.node.altText || node.title,
    },
  }));
}

export function formatProduct(product: ShopifyProduct) {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    price: parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2),
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    images: product.images.edges.map(({ node }) => ({
      url: node.url,
      altText: node.altText || product.title,
    })),
    options: product.options,
    variants: product.variants?.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      availableForSale: node.availableForSale,
      quantityAvailable: node.quantityAvailable,
      price: parseFloat(node.priceV2.amount).toFixed(2),
      currencyCode: node.priceV2.currencyCode,
      selectedOptions: node.selectedOptions,
    })),
  };
}
