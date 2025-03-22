import { adminClient } from "./client";
import {
  ShopifyCustomer,
  ShopifyAddress,
  CustomerCreateResponse,
  CustomerAddressCreateResponse,
  CustomerAddressUpdateResponse,
  CustomerAddressDeleteResponse,
  CustomerDefaultAddressUpdateResponse,
} from "@/types/shopify-types";
import { Address } from "@/types/user-types";
import {
  CREATE_CUSTOMER_MUTATION,
  GET_CUSTOMER_QUERY,
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
} from "./queries/customerQueries";

/**
 * Creates a new customer in Shopify
 */
export async function createShopifyCustomer(
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
): Promise<ShopifyCustomer | null> {
  try {
    const variables = {
      input: {
        email,
        firstName,
        lastName,
        phone,
      },
    };

    const data = await adminClient.request<CustomerCreateResponse>(
      CREATE_CUSTOMER_MUTATION,
      variables
    );

    if (data.customerCreate.userErrors.length > 0) {
      console.error(
        "Shopify customer creation errors:",
        data.customerCreate.userErrors
      );
      return null;
    }

    return data.customerCreate.customer;
  } catch (error) {
    console.error("Error creating Shopify customer:", error);
    return null;
  }
}

/**
 * Gets a customer by ID from Shopify
 */
export async function getShopifyCustomer(
  customerId: string
): Promise<ShopifyCustomer | null> {
  try {
    const variables = {
      id: `gid://shopify/Customer/${customerId}`,
    };

    const data = await adminClient.request<{ customer: ShopifyCustomer }>(
      GET_CUSTOMER_QUERY,
      variables
    );
    return data.customer;
  } catch (error) {
    console.error("Error fetching Shopify customer:", error);
    return null;
  }
}

/**
 * Transforms Shopify addresses to our app format
 */
export function transformShopifyAddresses(
  shopifyAddresses: ShopifyAddress[],
  defaultAddressId?: string
): Address[] {
  return shopifyAddresses.map((addr) => ({
    id: addr.id.replace("gid://shopify/MailingAddress/", ""),
    address1: addr.address1,
    address2: addr.address2 || "",
    city: addr.city,
    province: addr.province,
    country: addr.country,
    zip: addr.zip,
    phone: addr.phone || "",
    isDefault: defaultAddressId ? addr.id === defaultAddressId : false,
  }));
}

/**
 * Gets all addresses for a customer
 */
export async function getCustomerAddresses(
  customerId: string
): Promise<Address[]> {
  try {
    const customer = await getShopifyCustomer(customerId);

    if (!customer || !customer.addresses) {
      return [];
    }

    // Handle the edges structure from the Shopify API
    const addresses = customer.addresses.edges.map((edge) => edge.node);
    const defaultAddressId = customer.defaultAddress?.id;

    return transformShopifyAddresses(addresses, defaultAddressId);
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    return [];
  }
}

/**
 * Creates a new address for a customer
 */
export async function createCustomerAddress(
  customerId: string,
  address: Omit<Address, "id" | "isDefault">
): Promise<Address | null> {
  try {
    const variables = {
      customerId: `gid://shopify/Customer/${customerId}`,
      address: {
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        country: address.country,
        zip: address.zip,
        phone: address.phone,
      },
    };

    const data = await adminClient.request<CustomerAddressCreateResponse>(
      CREATE_ADDRESS_MUTATION,
      variables
    );

    if (data.customerAddressCreate.customerUserErrors.length > 0) {
      console.error(
        "Address creation errors:",
        data.customerAddressCreate.customerUserErrors
      );
      return null;
    }

    const newAddress = data.customerAddressCreate.customerAddress;
    return {
      id: newAddress.id.replace("gid://shopify/MailingAddress/", ""),
      address1: newAddress.address1,
      address2: newAddress.address2 || "",
      city: newAddress.city,
      province: newAddress.province,
      country: newAddress.country,
      zip: newAddress.zip,
      phone: newAddress.phone || "",
      isDefault: false,
    };
  } catch (error) {
    console.error("Error creating address:", error);
    return null;
  }
}

/**
 * Updates an existing customer address
 */
export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  address: Omit<Address, "id" | "isDefault">
): Promise<Address | null> {
  try {
    const variables = {
      customerId: `gid://shopify/Customer/${customerId}`,
      id: `gid://shopify/MailingAddress/${addressId}`,
      address: {
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        country: address.country,
        zip: address.zip,
        phone: address.phone,
      },
    };

    const data = await adminClient.request<CustomerAddressUpdateResponse>(
      UPDATE_ADDRESS_MUTATION,
      variables
    );

    if (data.customerAddressUpdate.customerUserErrors.length > 0) {
      console.error(
        "Address update errors:",
        data.customerAddressUpdate.customerUserErrors
      );
      return null;
    }

    const updatedAddress = data.customerAddressUpdate.customerAddress;
    return {
      id: updatedAddress.id.replace("gid://shopify/MailingAddress/", ""),
      address1: updatedAddress.address1,
      address2: updatedAddress.address2 || "",
      city: updatedAddress.city,
      province: updatedAddress.province,
      country: updatedAddress.country,
      zip: updatedAddress.zip,
      phone: updatedAddress.phone || "",
      isDefault: false, // We don't know this from the update response
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return null;
  }
}

/**
 * Deletes a customer address
 */
export async function deleteCustomerAddress(
  customerId: string,
  addressId: string
): Promise<boolean> {
  try {
    const variables = {
      customerId: `gid://shopify/Customer/${customerId}`,
      id: `gid://shopify/MailingAddress/${addressId}`,
    };

    const data = await adminClient.request<CustomerAddressDeleteResponse>(
      DELETE_ADDRESS_MUTATION,
      variables
    );

    if (data.customerAddressDelete.customerUserErrors.length > 0) {
      console.error(
        "Address deletion errors:",
        data.customerAddressDelete.customerUserErrors
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting address:", error);
    return false;
  }
}

/**
 * Sets an address as the default for a customer
 */
export async function setDefaultCustomerAddress(
  customerId: string,
  addressId: string
): Promise<boolean> {
  try {
    const variables = {
      customerId: `gid://shopify/Customer/${customerId}`,
      addressId: `gid://shopify/MailingAddress/${addressId}`,
    };

    const data =
      await adminClient.request<CustomerDefaultAddressUpdateResponse>(
        SET_DEFAULT_ADDRESS_MUTATION,
        variables
      );

    if (data.customerDefaultAddressUpdate.customerUserErrors.length > 0) {
      console.error(
        "Set default address errors:",
        data.customerDefaultAddressUpdate.customerUserErrors
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error setting default address:", error);
    return false;
  }
}
