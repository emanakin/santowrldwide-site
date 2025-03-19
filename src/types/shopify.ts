// Shopify API related types

// Customer types
export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: ShopifyAddress;
  addresses?: {
    edges: Array<{
      node: ShopifyAddress;
    }>;
  };
  orders?: {
    edges: Array<{
      node: ShopifyOrder;
    }>;
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
      code: string;
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

export interface CustomerQueryResponse {
  customer: ShopifyCustomer | null;
}
