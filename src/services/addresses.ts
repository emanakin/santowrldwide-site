import { Address } from "@/types/user-types";
import { auth } from "@/lib/firebase/client/firebaseApp";

/**
 * Fetches all addresses for the current user
 */
export async function getUserAddresses(): Promise<Address[]> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await fetch("/api/user/addresses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }

  return await response.json();
}

/**
 * Creates a new address for the current user
 */
export async function createAddress(
  addressData: Omit<Address, "id" | "isDefault">
): Promise<Address> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await fetch("/api/user/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    throw new Error("Failed to create address");
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
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const cleanAddressId = addressId.split("?")[0];

  const response = await fetch(`/api/user/addresses/${cleanAddressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    throw new Error("Failed to update address");
  }

  return await response.json();
}

/**
 * Deletes an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await fetch(`/api/user/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete address");
  }
}

/**
 * Sets an address as the default
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  // Sanitize the ID before using it in the URL
  const cleanAddressId = addressId.split("?")[0];

  const response = await fetch(
    `/api/user/addresses/${cleanAddressId}/default`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to set default address");
  }
}
