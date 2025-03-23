import { storefrontClient } from "./client";
import { shopifyRequest } from "./utils";
import {
  CUSTOMER_CREATE_MUTATION,
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_RENEW,
  GET_CUSTOMER,
  CUSTOMER_UPDATE,
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE,
  CUSTOMER_RECOVER,
  CUSTOMER_RESET,
  GET_CUSTOMER_ORDERS,
} from "./queries/customerQueries";
import {
  CustomerCreateResponse,
  CustomerAccessTokenResponse,
  CustomerAccessTokenRenewResponse,
  CustomerQueryResponse,
  CustomerUpdateResponse,
  CustomerAddressCreateResponse,
  CustomerAddressUpdateResponse,
  CustomerAddressDeleteResponse,
  CustomerDefaultAddressUpdateResponse,
  CustomerRecoverResponse,
  CustomerResetResponse,
  CustomerOrdersResponse,
  MailingAddressInput,
} from "@/types/shopify-types";

/**
 * Creates a new customer account with enhanced debugging
 */
export async function createCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const variables = {
    input: {
      email,
      password,
      firstName,
      lastName,
    },
  };

  console.log(`Attempting to create Shopify customer with email: ${email}`);

  try {
    const response = await storefrontClient.request<CustomerCreateResponse>(
      CUSTOMER_CREATE_MUTATION,
      variables
    );

    console.log(
      "Shopify customer creation response:",
      JSON.stringify({
        success: !!response?.customerCreate?.customer,
        errors: response?.customerCreate?.userErrors || [],
      })
    );

    return response;
  } catch (error) {
    console.error("Error creating Shopify customer:", error);
    throw error;
  }
}

/**
 * Gets a customer access token (login)
 */
export async function getCustomerAccessToken(email: string, password: string) {
  const variables = {
    input: {
      email,
      password,
    },
  };

  const response = await shopifyRequest<CustomerAccessTokenResponse>(
    CUSTOMER_ACCESS_TOKEN_CREATE,
    storefrontClient,
    variables,
    `Getting access token for ${email}`
  );

  if (!response?.customerAccessTokenCreate.customerAccessToken) {
    throw new Error(
      response?.customerAccessTokenCreate.customerUserErrors[0]?.message ||
        "Failed to authenticate customer"
    );
  }

  return response.customerAccessTokenCreate.customerAccessToken;
}

/**
 * Renews a customer access token
 */
export async function renewCustomerAccessToken(customerAccessToken: string) {
  const variables = {
    customerAccessToken,
  };

  const response = await shopifyRequest<CustomerAccessTokenRenewResponse>(
    CUSTOMER_ACCESS_TOKEN_RENEW,
    storefrontClient,
    variables,
    "Renewing customer access token"
  );

  if (!response?.customerAccessTokenRenew.customerAccessToken) {
    throw new Error(
      response?.customerAccessTokenRenew.customerUserErrors[0]?.message ||
        "Failed to renew customer access token"
    );
  }

  return response.customerAccessTokenRenew.customerAccessToken;
}

/**
 * Gets customer information
 */
export async function getCustomer(customerAccessToken: string) {
  const variables = {
    customerAccessToken,
  };

  const response = await shopifyRequest<CustomerQueryResponse>(
    GET_CUSTOMER,
    storefrontClient,
    variables,
    "Getting customer information"
  );

  if (!response?.customer) {
    throw new Error("Failed to get customer information");
  }

  return response.customer;
}

/**
 * Updates customer information
 */
export async function updateCustomer(
  customerAccessToken: string,
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    acceptsMarketing?: boolean;
  }
) {
  const variables = {
    customerAccessToken,
    customer,
  };

  return shopifyRequest<CustomerUpdateResponse>(
    CUSTOMER_UPDATE,
    storefrontClient,
    variables,
    "Updating customer information"
  );
}

/**
 * Creates a customer address
 */
export async function createCustomerAddress(
  customerAccessToken: string,
  address: MailingAddressInput
) {
  const variables = {
    customerAccessToken,
    address,
  };

  return shopifyRequest<CustomerAddressCreateResponse>(
    CUSTOMER_ADDRESS_CREATE,
    storefrontClient,
    variables,
    "Creating customer address"
  );
}

/**
 * Updates a customer address
 */
export async function updateCustomerAddress(
  customerAccessToken: string,
  addressId: string,
  address: MailingAddressInput
) {
  const variables = {
    customerAccessToken,
    id: addressId,
    address,
  };

  return shopifyRequest<CustomerAddressUpdateResponse>(
    CUSTOMER_ADDRESS_UPDATE,
    storefrontClient,
    variables,
    `Updating address ${addressId}`
  );
}

/**
 * Deletes a customer address
 */
export async function deleteCustomerAddress(
  customerAccessToken: string,
  addressId: string
) {
  const variables = {
    customerAccessToken,
    id: addressId,
  };

  return shopifyRequest<CustomerAddressDeleteResponse>(
    CUSTOMER_ADDRESS_DELETE,
    storefrontClient,
    variables,
    `Deleting address ${addressId}`
  );
}

/**
 * Sets a customer's default address
 */
export async function setDefaultCustomerAddress(
  customerAccessToken: string,
  addressId: string
) {
  const variables = {
    customerAccessToken,
    addressId,
  };

  return shopifyRequest<CustomerDefaultAddressUpdateResponse>(
    CUSTOMER_DEFAULT_ADDRESS_UPDATE,
    storefrontClient,
    variables,
    `Setting default address to ${addressId}`
  );
}

/**
 * Requests a password reset for a customer
 */
export async function requestPasswordReset(email: string) {
  const variables = {
    email,
  };

  return shopifyRequest<CustomerRecoverResponse>(
    CUSTOMER_RECOVER,
    storefrontClient,
    variables,
    `Requesting password reset for ${email}`
  );
}

/**
 * Resets a customer's password using a reset token
 */
export async function resetPassword(
  customerId: string,
  resetToken: string,
  password: string
) {
  const variables = {
    id: customerId,
    input: {
      resetToken,
      password,
    },
  };

  return shopifyRequest<CustomerResetResponse>(
    CUSTOMER_RESET,
    storefrontClient,
    variables,
    "Resetting customer password"
  );
}

/**
 * Gets a customer's order history
 */
export async function getCustomerOrders(
  customerAccessToken: string,
  first: number = 10
) {
  const variables = {
    customerAccessToken,
    first,
  };

  const response = await shopifyRequest<CustomerOrdersResponse>(
    GET_CUSTOMER_ORDERS,
    storefrontClient,
    variables,
    "Getting customer order history"
  );

  if (!response?.customer) {
    throw new Error("Failed to get customer orders");
  }

  return response.customer.orders;
}
