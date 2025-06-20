import { storefrontClient } from "./client";
import { shopifyRequest } from "./utils";
import { CartItem } from "@/types/product-types";
import {
  CartCreateResponse,
  CartLinesAddResponse,
  CartLinesUpdateResponse,
  CartLinesRemoveResponse,
  CartBuyerIdentityUpdateResponse,
  CartQueryResponse,
  CartInput,
  CartLineInput,
  CartLineUpdateInput,
  CartBuyerIdentityInput,
  ShopifyCart,
} from "@/types/shopify-types";

// GraphQL mutations for Cart API
const CART_CREATE = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
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
          }
        }
        estimatedCost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
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
          }
        }
        estimatedCost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
        estimatedCost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
        estimatedCost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        buyerIdentity {
          email
          phone
          customer {
            id
          }
        }
      }
    }
  }
`;

// Create a new cart
export async function createCart(items?: CartItem[]): Promise<ShopifyCart> {
  const variables: { input: CartInput } = {
    input: {},
  };

  // If items are provided, add them to the cart creation
  if (items && items.length > 0) {
    variables.input.lines = items.map(
      (item): CartLineInput => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })
    );
  }

  const response = await shopifyRequest<CartCreateResponse>(
    CART_CREATE,
    storefrontClient,
    variables,
    "Creating new cart"
  );

  if (!response?.cartCreate?.cart) {
    throw new Error("Failed to create cart");
  }

  return response.cartCreate.cart;
}

// Add items to an existing cart
export async function addCartItems(
  cartId: string,
  items: CartItem[]
): Promise<ShopifyCart> {
  const variables = {
    cartId,
    lines: items.map(
      (item): CartLineInput => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })
    ),
  };

  const response = await shopifyRequest<CartLinesAddResponse>(
    CART_LINES_ADD,
    storefrontClient,
    variables,
    "Adding items to cart"
  );

  if (!response?.cartLinesAdd?.cart) {
    throw new Error("Failed to add items to cart");
  }

  return response.cartLinesAdd.cart;
}

// Update cart items
export async function updateCartItems(
  cartId: string,
  updates: { lineId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const variables = {
    cartId,
    lines: updates.map(
      (update): CartLineUpdateInput => ({
        id: update.lineId,
        quantity: update.quantity,
      })
    ),
  };

  const response = await shopifyRequest<CartLinesUpdateResponse>(
    CART_LINES_UPDATE,
    storefrontClient,
    variables,
    "Updating cart items"
  );

  if (!response?.cartLinesUpdate?.cart) {
    throw new Error("Failed to update cart items");
  }

  return response.cartLinesUpdate.cart;
}

// Remove items from cart
export async function removeCartItems(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const variables = {
    cartId,
    lineIds,
  };

  const response = await shopifyRequest<CartLinesRemoveResponse>(
    CART_LINES_REMOVE,
    storefrontClient,
    variables,
    "Removing items from cart"
  );

  if (!response?.cartLinesRemove?.cart) {
    throw new Error("Failed to remove items from cart");
  }

  return response.cartLinesRemove.cart;
}

// Update buyer identity (for customer association)
export async function updateCartBuyerIdentity(
  cartId: string,
  email: string,
  customerAccessToken?: string
): Promise<ShopifyCart> {
  const buyerIdentity: CartBuyerIdentityInput = {
    email,
  };

  // If customer access token is provided, associate the cart with the customer
  if (customerAccessToken) {
    buyerIdentity.customerAccessToken = customerAccessToken;
  }

  const variables = {
    cartId,
    buyerIdentity,
  };

  const response = await shopifyRequest<CartBuyerIdentityUpdateResponse>(
    CART_BUYER_IDENTITY_UPDATE,
    storefrontClient,
    variables,
    "Updating cart buyer identity"
  );

  if (!response?.cartBuyerIdentityUpdate?.cart) {
    throw new Error("Failed to update cart buyer identity");
  }

  return response.cartBuyerIdentityUpdate.cart;
}

// Fetch cart by ID
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const GET_CART = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
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
          }
        }
        estimatedCost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const variables = {
    cartId,
  };

  const response = await shopifyRequest<CartQueryResponse>(
    GET_CART,
    storefrontClient,
    variables,
    "Fetching cart"
  );

  return response?.cart || null;
}

// Convert Shopify cart to local cart format
export function shopifyCartToLocalCart(shopifyCart: ShopifyCart | null): {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
} {
  if (!shopifyCart || !shopifyCart.lines.edges) {
    return { items: [], subtotal: 0, tax: 0, total: 0 };
  }

  const items = shopifyCart.lines.edges.map((edge) => {
    const { node } = edge;
    const merchandise = node.merchandise;
    const product = merchandise.product;
    const imageUrl =
      product.images.edges.length > 0
        ? product.images.edges[0].node.url
        : undefined;

    return {
      id: node.id,
      variantId: merchandise.id,
      quantity: node.quantity,
      title: product.title,
      price: merchandise.price.amount,
      imageUrl,
    };
  });

  const subtotal = parseFloat(shopifyCart.estimatedCost.subtotalAmount.amount);
  const shopifyTax = shopifyCart.estimatedCost.totalTaxAmount
    ? parseFloat(shopifyCart.estimatedCost.totalTaxAmount.amount)
    : 0;

  // Use Shopify's tax if available, otherwise calculate 13% as default estimate for Canadian customers
  // The actual tax will be calculated by Shopify when the user enters their address during checkout
  const tax = shopifyTax > 0 ? shopifyTax : subtotal * 0.13;

  const shopifyTotal = parseFloat(shopifyCart.estimatedCost.totalAmount.amount);
  // If we're using estimated tax (shopifyTax was 0), recalculate total
  const total = shopifyTax > 0 ? shopifyTotal : subtotal + tax;

  return { items, subtotal, tax, total };
}
