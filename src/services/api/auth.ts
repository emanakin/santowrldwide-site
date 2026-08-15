import { adminAuth } from "@/lib/firebase/admin/firebaseAdmin";
import {
  getUserFromFirestoreAdmin,
  saveUserToFirestoreAdmin,
} from "@/lib/firebase/admin/firestore";
import { generateSecurePassword } from "@/lib/shopify/utils";
import {
  createCustomer,
  getCustomerAccessToken,
} from "@/lib/shopify/customers";

/**
 * Authenticates a user by email
 */
export async function loginUser(email: string) {
  if (!adminAuth) {
    throw new Error("Firebase admin is not initialized");
  }

  // Find the user by email
  const userRecord = await adminAuth.getUserByEmail(email);
  const userId = userRecord.uid;

  // Fetch additional user details from Firestore
  let userData = await getUserFromFirestoreAdmin(userId);

  // If user doesn't exist in Firestore, create them
  if (!userData) {
    console.log("🆕 Creating missing user in Firestore:", userId);
    await saveUserToFirestoreAdmin(userId, {
      email: userRecord.email || "",
    });

    // Get the newly created user data
    userData = await getUserFromFirestoreAdmin(userId);
  }

  if (!userData) {
    throw new Error("User data not found");
  }

  // If we don't have a shopifyPassword stored, generate one
  const shopifyPassword = userData.shopifyPassword || generateSecurePassword();

  // If shopifyPassword wasn't in the database, save it now
  if (!userData.shopifyPassword) {
    await saveUserToFirestoreAdmin(userId, {
      ...userData,
      shopifyPassword,
    });
  }

  // Get a Shopify customer access token using the Storefront API
  const shopifyToken = await getCustomerAccessToken(
    userData.email || "",
    shopifyPassword
  );

  return {
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    },
    metadata: userData,
    shopifyToken,
  };
}

/**
 * Registers a new user with email, password and name
 */
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  // Generate a secure password for Shopify (can be different than Firebase password)
  const shopifyPassword = generateSecurePassword();

  // Create Shopify customer using Storefront API
  const shopifyCustomerResponse = await createCustomer(
    email,
    shopifyPassword,
    firstName,
    lastName
  );

  if (!shopifyCustomerResponse?.customerCreate.customer) {
    const error =
      shopifyCustomerResponse?.customerCreate.customerUserErrors[0]?.message ||
      "Failed to create Shopify customer";
    throw new Error(error);
  }

  const shopifyCustomer = shopifyCustomerResponse.customerCreate.customer;
  console.log("✅ Shopify Customer Created:", shopifyCustomer.id);

  if (!adminAuth) {
    throw new Error("Firebase admin is not initialized");
  }

  // Create Firebase Auth User with Admin SDK
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`,
  });
  const userId = userRecord.uid;

  console.log("✅ Firebase User Created:", userId);

  // Save User to Firestore with the Shopify customer ID and password
  const userData = {
    email,
    firstName,
    lastName,
    shopifyCustomerId: shopifyCustomer.id,
    shopifyPassword,
  };

  await saveUserToFirestoreAdmin(userId, userData);

  // Get a Shopify customer access token
  const shopifyToken = await getCustomerAccessToken(email, shopifyPassword);

  return {
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    },
    shopifyCustomerId: shopifyCustomer.id,
    shopifyToken,
  };
}

type ShopifyCustomerToken = {
  accessToken: string;
  expiresAt: string;
};

/**
 * Best-effort Shopify customer + access token for a social login.
 * Firebase auth already succeeded; a Shopify mismatch must not fail the login.
 */
async function ensureShopifyCustomerAccess(params: {
  email: string;
  firstName: string;
  lastName: string;
  existingCustomerId?: string | null;
  existingPassword?: string | null;
}): Promise<{
  shopifyCustomerId?: string | null;
  shopifyPassword?: string | null;
  shopifyToken?: ShopifyCustomerToken;
}> {
  const { email, firstName, lastName, existingCustomerId, existingPassword } =
    params;

  if (existingPassword) {
    try {
      const shopifyToken = await getCustomerAccessToken(email, existingPassword);
      return {
        shopifyCustomerId: existingCustomerId,
        shopifyPassword: existingPassword,
        shopifyToken,
      };
    } catch (error) {
      console.warn(
        "Stored Shopify credentials failed; trying to create a customer:",
        error
      );
    }
  }

  const shopifyPassword = generateSecurePassword();
  let shopifyCustomerResponse;
  try {
    shopifyCustomerResponse = await createCustomer(
      email,
      shopifyPassword,
      firstName,
      lastName
    );
  } catch (error) {
    console.warn("Shopify customerCreate request failed:", error);
    return {
      shopifyCustomerId: existingCustomerId,
      shopifyPassword: existingPassword,
    };
  }
  const customer = shopifyCustomerResponse?.customerCreate?.customer;
  const createError =
    shopifyCustomerResponse?.customerCreate?.customerUserErrors?.[0]?.message;

  if (customer) {
    try {
      const shopifyToken = await getCustomerAccessToken(email, shopifyPassword);
      return {
        shopifyCustomerId: customer.id,
        shopifyPassword,
        shopifyToken,
      };
    } catch (error) {
      console.error(
        "Created Shopify customer but could not get an access token:",
        error
      );
      return {
        shopifyCustomerId: customer.id,
        shopifyPassword,
      };
    }
  }

  console.warn(
    "Could not create Shopify customer for social login:",
    createError || "unknown error"
  );
  return {
    shopifyCustomerId: existingCustomerId,
    shopifyPassword: existingPassword,
  };
}

/**
 * Authenticates a user with social login
 */
export async function socialAuthUser(idToken: string) {
  if (!adminAuth) {
    throw new Error("Firebase admin is not initialized");
  }

  // Verify the Firebase token
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const userId = decodedToken?.uid;

  // Get the user record
  const userRecord = await adminAuth.getUser(userId);
  const email = userRecord?.email || "";

  // Initial display name from provider (may be null)
  const displayName = userRecord.displayName || "";

  // Split display name into first and last name (if available)
  let firstName = "";
  let lastName = "";

  if (displayName) {
    const nameParts = displayName.split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }

  // Check if user exists in Firestore
  let userData = await getUserFromFirestoreAdmin(userId);

  let shopifyAccess: Awaited<ReturnType<typeof ensureShopifyCustomerAccess>> =
    {};
  try {
    shopifyAccess = await ensureShopifyCustomerAccess({
      email,
      firstName: userData?.firstName || firstName,
      lastName: userData?.lastName || lastName,
      existingCustomerId: userData?.shopifyCustomerId,
      existingPassword: userData?.shopifyPassword,
    });
  } catch (error) {
    console.error("Shopify association failed for social login:", error);
  }

  if (!userData) {
    console.log("🆕 Creating new social user in Firestore:", userId);
    await saveUserToFirestoreAdmin(userId, {
      email,
      firstName,
      lastName,
      shopifyCustomerId: shopifyAccess.shopifyCustomerId,
      shopifyPassword: shopifyAccess.shopifyPassword,
    });
    userData = await getUserFromFirestoreAdmin(userId);
  } else if (
    shopifyAccess.shopifyCustomerId !== userData.shopifyCustomerId ||
    shopifyAccess.shopifyPassword !== userData.shopifyPassword
  ) {
    await saveUserToFirestoreAdmin(userId, {
      ...userData,
      shopifyCustomerId: shopifyAccess.shopifyCustomerId,
      shopifyPassword: shopifyAccess.shopifyPassword,
    });
    userData = await getUserFromFirestoreAdmin(userId);
  }

  return {
    user: {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    },
    metadata: userData,
    shopifyToken: shopifyAccess.shopifyToken,
  };
}
