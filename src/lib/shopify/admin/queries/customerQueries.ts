// GraphQL queries for Shopify Customer operations

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

export const CREATE_ADDRESS_MUTATION = `
  mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
    customerAddressCreate(customerId: $customerId, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = `
  mutation customerAddressUpdate($customerId: ID!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerId: $customerId, id: $id, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = `
  mutation customerAddressDelete($id: ID!, $customerId: ID!) {
    customerAddressDelete(id: $id, customerId: $customerId) {
      deletedCustomerAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation customerDefaultAddressUpdate($customerId: ID!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerId: $customerId, addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
