import { GraphQLClient } from "graphql-request";
import { ShopifyProduct, ProductsResponse } from "@/types/product-types";
import { ShopifyAddress } from "@/types/shopify-types";
import { Address } from "@/types/user-types";
import { MailingAddressInput } from "@/types/shopify-types";

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

/**
 * Transforms Shopify addresses to our app format
 */
export function transformShopifyAddresses(
  shopifyAddresses: ShopifyAddress[],
  defaultAddressId?: string
): Address[] {
  return shopifyAddresses.map((addr) => {
    // Remove only the prefix but keep any query parameters
    const cleanId = addr.id.replace("gid://shopify/MailingAddress/", "");
    return {
      id: cleanId,
      address1: addr.address1,
      address2: addr.address2 || "",
      city: addr.city,
      province: addr.province,
      country: addr.country,
      zip: addr.zip,
      phone: addr.phone || "",
      isDefault: defaultAddressId ? addr.id === defaultAddressId : false,
      // Store the original full ID to use when updating
      originalId: addr.id,
    };
  });
}

export function prepareAddressForShopifyUpdate(
  addr: Address
): MailingAddressInput {
  // If we have the original ID stored, use it directly
  const id = addr.originalId || `gid://shopify/MailingAddress/${addr.id}`;

  return {
    id,
    address1: addr.address1,
    address2: addr.address2,
    city: addr.city,
    province: addr.province,
    country: addr.country,
    zip: addr.zip,
    phone: addr.phone,
  };
}

// Helper: Updates one address in an array of addresses
export function updateAddressInList(
  addresses: Address[],
  addressId: string,
  updated: Omit<Address, "isDefault">
): Address[] {
  return addresses.map((addr) => {
    if (addr.id === addressId) {
      return { ...addr, ...updated };
    }
    return addr;
  });
}
