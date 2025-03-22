import { gql } from "graphql-request";

export const CREATE_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_CUSTOMER_QUERY = `
  query getCustomer($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      addresses {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
        firstName
        lastName
        company
        formattedArea
      }
      defaultAddress {
        id
      }
    }
  }
`;

export const CUSTOMER_UPDATE_MUTATION = gql`
  mutation customerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        addresses {
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
      userErrors {
        field
        message
      }
    }
  }
`;
