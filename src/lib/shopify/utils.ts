import { GraphQLClient } from "graphql-request";
import { ShopifyProduct, ProductsResponse } from "@/types/product-types";
import { ShopifyAddress } from "@/types/shopify-types";

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
    images: {
      edges: node.images.edges.map((edge) => ({
        node: {
          url: edge.node.url,
          altText: edge.node.altText || node.title,
        },
      })),
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

/**
 * Extracts the expiration date from a Shopify customer token
 */
export function getTokenExpirationDate(expiresAt: string): Date {
  return new Date(expiresAt);
}

/**
 * Checks if a token is expiring soon (within the next hour)
 */
export function isTokenExpiringSoon(expiresAt: string): boolean {
  const expiration = getTokenExpirationDate(expiresAt);
  const now = new Date();

  // Check if token expires in less than 1 hour
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  return expiration < oneHourFromNow;
}

/**
 * Formats customer address for display
 */
export function formatCustomerAddress(address: ShopifyAddress): string {
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.country,
    address.zip,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Extracts ID from Shopify GID format
 * Example: "gid://shopify/Customer/1234567890" -> "1234567890"
 */
export function extractIdFromGid(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1];
}

/**
 * Generates a secure random password for Shopify customers
 * Shopify has a 40 character maximum password length
 */
export function generateSecurePassword(): string {
  // Create a shorter, but still secure password
  // This will be ~20 characters which is plenty secure but under Shopify's limit
  const randomBytes = new Uint8Array(15);
  crypto.getRandomValues(randomBytes);

  // Convert to base64 (~ 20 chars) and remove non-alphanumeric characters
  return btoa(String.fromCharCode(...randomBytes))
    .replace(/[+/=]/g, "") // Remove chars that might cause issues
    .substring(0, 20); // Ensure we're well under the 40 char limit
}
