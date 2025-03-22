import { getShopifyCustomerToken } from "@/lib/shopify/addresses";

// Check if token is expired or will expire soon
export function isTokenExpired(
  expiresAt: string,
  bufferMinutes: number = 5
): boolean {
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();

  // Convert buffer minutes to milliseconds
  const bufferMs = bufferMinutes * 60 * 1000;

  // Check if token is expired or will expire within the buffer time
  return currentTime + bufferMs > expiryTime;
}

// Function to manage token state and refresh as needed
export async function getValidShopifyToken(
  email: string,
  password: string
): Promise<string | null> {
  // Check if we have a stored token
  const storedToken = localStorage.getItem("shopifyAccessToken");
  const storedExpiry = localStorage.getItem("shopifyTokenExpiry");

  // If we have a valid token that's not about to expire, return it
  if (storedToken && storedExpiry && !isTokenExpired(storedExpiry)) {
    return storedToken;
  }

  // Otherwise, get a new token
  const tokenData = await getShopifyCustomerToken(email, password);

  if (tokenData && tokenData.token && tokenData.expiresAt) {
    localStorage.setItem("shopifyAccessToken", tokenData.token);
    localStorage.setItem("shopifyTokenExpiry", tokenData.expiresAt);
    return tokenData.token;
  }

  return null;
}

// Reusable function to fetch shopify access token
export function fetchShopifyAccessToken(
  redirectOnExpired = true
): string | null {
  const token = localStorage.getItem("shopifyAccessToken");
  const expiry = localStorage.getItem("shopifyTokenExpiry");

  if (!token || !expiry) {
    return null;
  }

  if (isTokenExpired(expiry)) {
    // Token is expired
    if (redirectOnExpired) {
      // Clear the expired token
      localStorage.removeItem("shopifyAccessToken");
      localStorage.removeItem("shopifyTokenExpiry");

      // This function can't directly use the router hook, but the calling component can handle redirection
      console.warn("Shopify token expired");
      return null;
    }
  }

  return token;
}

/**
 * Gets and stores a Shopify access token
 * @param userCredential User credential object or email/password pair
 * @returns True if token was successfully retrieved and stored
 */
export async function getAndStoreShopifyToken(userCredential: {
  email: string;
  password?: string;
  userID?: string; // For social logins
  isEmailPassword: boolean;
}): Promise<boolean> {
  try {
    // For email/password authentication
    if (userCredential.isEmailPassword && userCredential.password) {
      const { getShopifyCustomerToken } = await import(
        "@/lib/shopify/addresses"
      );
      const tokenData = await getShopifyCustomerToken(
        userCredential.email,
        userCredential.password
      );

      if (tokenData && tokenData.token && tokenData.expiresAt) {
        localStorage.setItem("shopifyAccessToken", tokenData.token);
        localStorage.setItem("shopifyTokenExpiry", tokenData.expiresAt);
        console.log("✅ Shopify access token stored");
        return true;
      }
    }
    // For social authentication
    else if (userCredential.userID) {
      // Store the user ID for social login users
      // We'll use this to identify the user for Shopify operations
      localStorage.setItem("shopifyUserID", userCredential.userID);
      localStorage.setItem("shopifyUserEmail", userCredential.email);
      console.log("✅ Shopify user info stored (social login)");
      return true;
    }

    return false;
  } catch (error) {
    // Don't fail the auth flow if Shopify token can't be retrieved
    console.error("Failed to get Shopify token:", error);
    return false;
  }
}
