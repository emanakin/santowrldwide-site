import { GraphQLClient } from "graphql-request";
import {
  CustomerCreateResponse,
  CustomerAccessTokenResponse,
  CustomerQueryResponse,
} from "@/types/shopify";

const client = new GraphQLClient(process.env.SHOPIFY_STOREFRONT_API_URL!, {
  headers: {
    "X-Shopify-Storefront-Access-Token":
      process.env.SHOPIFY_STOREFRONT_API_TOKEN!,
  },
});

// Create customer account
export async function createCustomerAccount(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      password,
      firstName,
      lastName,
      acceptsMarketing: true,
    },
  };

  const data = await client.request<CustomerCreateResponse>(
    mutation,
    variables
  );
  return data.customerCreate;
}

// Customer login
export async function customerLogin(email: string, password: string) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      password,
    },
  };

  const data = await client.request<CustomerAccessTokenResponse>(
    mutation,
    variables
  );
  return data.customerAccessTokenCreate;
}

// Get customer information
export async function getCustomer(accessToken: string) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        defaultAddress {
          id
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        addresses(first: 10) {
          edges {
            node {
              id
              address1
              address2
              city
              province
              country
              zip
              phone
            }
          }
        }
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    customerAccessToken: accessToken,
  };

  const data = await client.request<CustomerQueryResponse>(query, variables);
  return data.customer;
}
