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

export interface CustomerQueryResponse {
  customers: {
    edges: Array<{
      node: ShopifyCustomer;
    }>;
  };
}

// Address API responses
// Customer API responses

export interface CustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    userErrors: Array<{
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

export interface CustomerQueryResponse {
  customers: {
    edges: Array<{
      node: ShopifyCustomer;
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
