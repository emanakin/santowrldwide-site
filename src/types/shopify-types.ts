// Shopify API related types

// Customer types
export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  addresses: ShopifyAddress[]; // Direct array instead of edges/nodes
  defaultAddress?: {
    id: string;
  };
}

export interface ShopifyAddress {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string | null;
  formattedArea?: string;
}

export interface MailingAddressInput {
  id?: string; // GID format: gid://shopify/MailingAddress/{id}
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
}

// Customer API responses
export interface CustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: Array<{
      code?: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerAccessTokenResponse {
  customerAccessTokenCreate: {
    customerAccessToken: {
      accessToken: string;
      expiresAt: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: Array<{
      code?: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerUpdateResponse {
  customerUpdate: {
    customer: {
      id: string;
      addresses: ShopifyAddress[];
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerAccessTokenResponse {
  customerAccessTokenCreate: {
    customerAccessToken: {
      accessToken: string;
      expiresAt: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerAddressesResponse {
  customer: {
    addresses: {
      edges: Array<{
        node: ShopifyAddress;
      }>;
    };
    defaultAddress?: {
      id: string;
    };
  } | null;
}

export interface CustomerAccessTokenRenewResponse {
  customerAccessTokenRenew: {
    customerAccessToken: {
      accessToken: string;
      expiresAt: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerQueryResponse {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    displayName: string | null;
    defaultAddress: ShopifyAddress | null;
    addresses: {
      edges: Array<{
        node: ShopifyAddress;
      }>;
    };
  } | null;
}

export interface CustomerAddressCreateResponse {
  customerAddressCreate: {
    customerAddress: {
      id: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerAddressUpdateResponse {
  customerAddressUpdate: {
    customerAddress: {
      id: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerAddressDeleteResponse {
  customerAddressDelete: {
    deletedCustomerAddressId: string | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerDefaultAddressUpdateResponse {
  customerDefaultAddressUpdate: {
    customer: {
      id: string;
      defaultAddress: {
        id: string;
      } | null;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerRecoverResponse {
  customerRecover: {
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerResetResponse {
  customerReset: {
    customer: {
      id: string;
    } | null;
    customerAccessToken: {
      accessToken: string;
      expiresAt: string;
    } | null;
    customerUserErrors: Array<{
      code: string;
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CustomerOrdersResponse {
  customer: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          orderNumber: number;
          processedAt: string;
          financialStatus: string;
          fulfillmentStatus: string;
          totalPrice: {
            amount: string;
            currencyCode: string;
          };
          lineItems: {
            edges: Array<{
              node: {
                title: string;
                quantity: number;
                variant: {
                  id: string;
                  title: string;
                  price: {
                    amount: string;
                    currencyCode: string;
                  };
                  image: {
                    url: string;
                    altText: string | null;
                  } | null;
                } | null;
              };
            }>;
          };
        };
      }>;
    };
  } | null;
}

// Cart types
export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCartMerchandise {
  id: string;
  title: string;
  price: ShopifyPrice;
  product: {
    title: string;
    handle: string;
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyCartMerchandise;
}

export interface ShopifyCartEstimatedCost {
  subtotalAmount: ShopifyPrice;
  totalAmount: ShopifyPrice;
  totalTaxAmount: ShopifyPrice;
}

export interface ShopifyCartBuyerIdentity {
  email?: string;
  phone?: string;
  customer?: {
    id: string;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
  estimatedCost: ShopifyCartEstimatedCost;
  buyerIdentity?: ShopifyCartBuyerIdentity;
}

// Cart API responses
export interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CartBuyerIdentityUpdateResponse {
  cartBuyerIdentityUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
}

export interface CartQueryResponse {
  cart: ShopifyCart | null;
}

// Cart input types
export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

export interface CartBuyerIdentityInput {
  email?: string;
  phone?: string;
  customerAccessToken?: string;
}

export interface CartInput {
  lines?: CartLineInput[];
  buyerIdentity?: CartBuyerIdentityInput;
}

// Checkout types
export interface ShopifyCheckout {
  id: string;
  webUrl: string;
}

export interface CheckoutUserError {
  code?: string;
  field?: string[];
  message: string;
}

export interface CheckoutCreateResponse {
  checkoutCreate: {
    checkout: ShopifyCheckout | null;
    checkoutUserErrors: CheckoutUserError[];
  };
}

export interface CheckoutLineItemsReplaceResponse {
  checkoutLineItemsReplace: {
    checkout: ShopifyCheckout | null;
    userErrors: CheckoutUserError[];
  };
}

export interface CheckoutCustomerAssociateResponse {
  checkoutCustomerAssociateV2: {
    checkout: ShopifyCheckout | null;
    checkoutUserErrors: CheckoutUserError[];
  };
}

// Checkout input types
export interface CheckoutLineItemInput {
  variantId: string;
  quantity: number;
}

export interface CheckoutCreateInput {
  lineItems: CheckoutLineItemInput[];
}
