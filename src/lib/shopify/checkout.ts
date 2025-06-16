import { storefrontClient } from "./client";
import { shopifyRequest } from "./utils";
import { CartItem } from "@/context/CartContext";

// GraphQL mutations for checkout
const CREATE_CHECKOUT = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

const UPDATE_CHECKOUT = `
  mutation checkoutLineItemsReplace($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        webUrl
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const ASSOCIATE_CUSTOMER_WITH_CHECKOUT = `
  mutation checkoutCustomerAssociateV2($checkoutId: ID!, $customerAccessToken: String!) {
    checkoutCustomerAssociateV2(checkoutId: $checkoutId, customerAccessToken: $customerAccessToken) {
      checkout {
        id
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Create a new checkout
export async function createCheckout(cartItems: CartItem[]): Promise<string> {
  const lineItems = cartItems.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  const variables = {
    input: {
      lineItems,
    },
  };

  const response = await shopifyRequest(
    CREATE_CHECKOUT,
    storefrontClient,
    variables,
    "Creating new checkout"
  );

  if (!response?.checkoutCreate?.checkout) {
    throw new Error("Failed to create checkout");
  }

  return response.checkoutCreate.checkout.id;
}

// Update an existing checkout
export async function updateCheckout(
  checkoutId: string,
  cartItems: CartItem[]
) {
  const lineItems = cartItems.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  const variables = {
    checkoutId,
    lineItems,
  };

  const response = await shopifyRequest(
    UPDATE_CHECKOUT,
    storefrontClient,
    variables,
    "Updating checkout items"
  );

  if (!response?.checkoutLineItemsReplace?.checkout) {
    throw new Error("Failed to update checkout");
  }

  return response.checkoutLineItemsReplace.checkout;
}

// Associate a customer with a checkout
export async function associateCustomerWithCheckout(
  checkoutId: string,
  customerAccessToken: string
) {
  const variables = {
    checkoutId,
    customerAccessToken,
  };

  const response = await shopifyRequest(
    ASSOCIATE_CUSTOMER_WITH_CHECKOUT,
    storefrontClient,
    variables,
    "Associating customer with checkout"
  );

  if (!response?.checkoutCustomerAssociateV2?.checkout) {
    throw new Error("Failed to associate customer with checkout");
  }

  return response.checkoutCustomerAssociateV2.checkout;
}

// Get checkout URL
export async function getCheckoutUrl(checkoutId: string): Promise<string> {
  // This would typically fetch the checkout to get its URL
  // For now, we'll construct it directly
  return `${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/checkout/${checkoutId}`;
}
