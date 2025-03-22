import { Address } from "@/types/user-types";

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
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch addresses");
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
    const error = await response.json();
    throw new Error(error.message || "Failed to create address");
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
  const response = await fetch(`/api/user/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update address");
  }

  return await response.json();
}

/**
 * Deletes an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const response = await fetch(`/api/user/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete address");
  }
}

/**
 * Sets an address as the default
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const response = await fetch(`/api/user/addresses/${addressId}/default`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to set default address");
  }
}
