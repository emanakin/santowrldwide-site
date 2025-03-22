import { adminClient } from "./client";
import {
  ShopifyCustomer,
  CustomerCreateResponse,
  CustomerUpdateResponse,
} from "@/types/shopify-types";
import { Address } from "@/types/user-types";
import {
  CREATE_CUSTOMER_MUTATION,
  GET_CUSTOMER_QUERY,
  CUSTOMER_UPDATE_MUTATION,
} from "./queries/customerQueries";
import {
  prepareAddressForShopifyUpdate,
  transformShopifyAddresses,
  updateAddressInList,
} from "../utils";

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
 * Gets all addresses for a customer
 */
export async function getCustomerAddresses(
  customerId: string
): Promise<Address[]> {
  try {
    const variables = {
      id: `gid://shopify/Customer/${customerId}`,
    };

    const data = await adminClient.request<{ customer: ShopifyCustomer }>(
      GET_CUSTOMER_QUERY,
      variables
    );

    const customer = data.customer;

    if (!customer || !customer.addresses) {
      console.log("No customer or addresses found");
      return [];
    }

    // The addresses are directly an array, not edges/nodes structure
    const addresses = Array.isArray(customer.addresses)
      ? customer.addresses
      : [];
    const defaultAddressId = customer.defaultAddress?.id;

    console.log("Default address ID:", defaultAddressId);

    const transformedAddresses = transformShopifyAddresses(
      addresses,
      defaultAddressId
    );

    return transformedAddresses;
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
    const existingAddresses = await getCustomerAddresses(customerId);

    // Clean and transform each address to match Shopify expectations
    const cleanedShopifyAddresses = existingAddresses.map(
      prepareAddressForShopifyUpdate
    );

    const variables = {
      input: {
        id: `gid://shopify/Customer/${customerId}`,
        addresses: [...cleanedShopifyAddresses, address], // Add new one last
      },
    };

    const data = await adminClient.request<CustomerUpdateResponse>(
      CUSTOMER_UPDATE_MUTATION,
      variables
    );

    if (data.customerUpdate.userErrors.length > 0) {
      console.error("Address creation errors:", data.customerUpdate.userErrors);
      return null;
    }

    const addresses = data.customerUpdate.customer?.addresses;
    const newAddress = addresses?.[addresses.length - 1];

    if (!newAddress) {
      console.error("No new address created");
      return null;
    }

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
  updated: Omit<Address, "isDefault">
): Promise<Address | null> {
  try {
    // 1. Fetch all addresses
    const existingAddresses = await getCustomerAddresses(customerId);

    // 2. Create a new array with the updated address data
    const updatedAddressesList = updateAddressInList(
      existingAddresses,
      addressId,
      updated
    );

    // 3. Convert addresses to Shopify's MailingAddressInput format
    const mailingAddressInputs = updatedAddressesList.map(
      prepareAddressForShopifyUpdate
    );

    // 4. Prepare variables for mutation
    const variables = {
      input: {
        id: `gid://shopify/Customer/${customerId}`,
        addresses: mailingAddressInputs,
      },
    };

    // 5. Send the update mutation
    const data = await adminClient.request<CustomerUpdateResponse>(
      CUSTOMER_UPDATE_MUTATION,
      variables
    );

    if (data.customerUpdate.userErrors.length > 0) {
      console.error("Address update errors:", data.customerUpdate.userErrors);
      return null;
    }

    // 6. Find the updated address in the response
    const updatedAddress = data.customerUpdate.customer?.addresses.find((a) =>
      a.id.endsWith(addressId)
    );

    return updatedAddress
      ? {
          id: updatedAddress.id.replace("gid://shopify/MailingAddress/", ""),
          address1: updatedAddress.address1,
          address2: updatedAddress.address2 || "",
          city: updatedAddress.city,
          province: updatedAddress.province,
          country: updatedAddress.country,
          zip: updatedAddress.zip,
          phone: updatedAddress.phone || "",
          isDefault: false,
        }
      : null;
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
    const existingAddresses = await getCustomerAddresses(customerId);

    const filtered = existingAddresses
      .filter((a) => a.id !== addressId)
      .map((a) => ({
        id: `gid://shopify/MailingAddress/${a.id}`,
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        province: a.province,
        country: a.country,
        zip: a.zip,
        phone: a.phone,
      }));

    const variables = {
      input: {
        id: `gid://shopify/Customer/${customerId}`,
        addresses: filtered,
      },
    };

    const data = await adminClient.request<CustomerUpdateResponse>(
      CUSTOMER_UPDATE_MUTATION,
      variables
    );

    if (data.customerUpdate.userErrors.length > 0) {
      console.error("Address deletion errors:", data.customerUpdate.userErrors);
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
    // Fetch existing addresses
    const addresses = await getCustomerAddresses(customerId);

    if (!addresses || addresses.length === 0) {
      console.error("No addresses found for customer");
      return false;
    }

    // Reorder addresses so that the addressId becomes the first element
    const reordered = addresses
      .sort((a, b) => {
        if (a.id === addressId) return -1;
        if (b.id === addressId) return 1;
        return 0;
      })
      .map((a) => ({
        id: `gid://shopify/MailingAddress/${a.id}`,
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        province: a.province,
        country: a.country,
        zip: a.zip,
        phone: a.phone,
      }));

    const variables = {
      input: {
        id: `gid://shopify/Customer/${customerId}`,
        addresses: reordered,
      },
    };

    const data = await adminClient.request<CustomerUpdateResponse>(
      CUSTOMER_UPDATE_MUTATION,
      variables
    );

    if (data.customerUpdate.userErrors.length > 0) {
      console.error(
        "Set default address errors:",
        data.customerUpdate.userErrors
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error setting default address:", error);
    return false;
  }
}
