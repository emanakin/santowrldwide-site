import { GraphQLClient } from "graphql-request";

// Initialize GraphQL client with Shopify Storefront API
const client = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      "Content-Type": "application/json",
    },
  }
);

// Define types for product data
interface ProductImage {
  url: string;
  altText: string | null;
}

interface ProductPrice {
  amount: string;
  currencyCode: string;
}

interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  priceV2: ProductPrice;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: ProductPrice;
  };
  images: {
    edges: {
      node: ProductImage;
    }[];
  };
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants?: {
    edges: {
      node: ProductVariant;
    }[];
  };
}

interface ProductsResponse {
  products: {
    edges: {
      node: ShopifyProduct;
    }[];
  };
}

interface ProductResponse {
  productByHandle: ShopifyProduct | null;
}

// Get all products
export async function getProducts() {
  const query = `
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.log("Fetching products from Shopify...");
    const data = await client.request<ProductsResponse>(query);
    console.log("Products fetched successfully:", data);

    return data.products.edges.map(({ node }) => ({
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
  } catch (error) {
    console.error("Error fetching products:", error);
    // Return empty array instead of throwing, for more graceful degradation
    return [];
  }
}

// Get single product by handle (slug)
export async function getProduct(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        options {
          id
          name
          values
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              quantityAvailable
              priceV2 {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await client.request<ProductResponse>(query, { handle });

    if (!data.productByHandle) return null;

    const product = data.productByHandle;
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      descriptionHtml: product.descriptionHtml,
      price: parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2),
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
      images: product.images.edges.map(({ node }: { node: ProductImage }) => ({
        url: node.url,
        altText: node.altText || product.title,
      })),
      options: product.options,
      variants: product.variants?.edges.map(
        ({ node }: { node: ProductVariant }) => ({
          id: node.id,
          title: node.title,
          availableForSale: node.availableForSale,
          quantityAvailable: node.quantityAvailable,
          price: parseFloat(node.priceV2.amount).toFixed(2),
          currencyCode: node.priceV2.currencyCode,
          selectedOptions: node.selectedOptions,
        })
      ),
    };
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error);
    return null;
  }
}
