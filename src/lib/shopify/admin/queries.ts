export const CREATE_CUSTOMER = `
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

export const UPDATE_CUSTOMER = `
  mutation customerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
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

export const GET_CUSTOMER = `
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
        zip
        country
        phone
      }
    }
  }
`;

export const GET_CUSTOMER_BY_EMAIL = `
  query getCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          firstName
          lastName
          email
          phone
        }
      }
    }
  }
`;

export const CREATE_ADDRESS = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_ADDRESS = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_ADDRESS = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors {
        field
        message
      }
    }
  }
`;

export const SET_DEFAULT_ADDRESS = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        field
        message
      }
    }
  }
`;
