import { Address } from "@/types/user-types";

/**
 * Ensure the Shopify ID is properly formatted for API calls
 */
function formatAddressId(addressId: string): string {
  // Convert GID format to URL-safe format
  // e.g. "gid://shopify/MailingAddress/1234567890" becomes a clean ID
  if (addressId.includes("gid://")) {
    return encodeURIComponent(addressId);
  }

  return addressId;
}

/**
 * Fetches all addresses for the current user
 */
export async function getUserAddresses(): Promise<Address[]> {
  const response = await fetch("/api/user/addresses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch addresses");
  }

  return await response.json();
}

/**
 * Creates a new address for the current user
 */
export async function createAddress(
  addressData: Omit<Address, "id" | "isDefault">
): Promise<Address> {
  const response = await fetch("/api/user/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create address");
  }

  return await response.json();
}

/**
 * Updates an existing address
 */
export async function updateAddress(
  addressId: string,
  addressData: Omit<Address, "id" | "isDefault">
): Promise<Address> {
  // Format the address ID for URL safety
  const encodedAddressId = formatAddressId(addressId);

  const response = await fetch(`/api/user/addresses/${encodedAddressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update address");
  }

  return await response.json();
}

/**
 * Deletes an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  // Format the address ID for URL safety
  const encodedAddressId = formatAddressId(addressId);

  const response = await fetch(`/api/user/addresses/${encodedAddressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete address");
  }
}

/**
 * Sets an address as the default
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  // Format the address ID for URL safety
  const encodedAddressId = formatAddressId(addressId);

  const response = await fetch(
    `/api/user/addresses/${encodedAddressId}/default`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to set default address");
  }
}
