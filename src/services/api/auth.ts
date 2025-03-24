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
      shopifyCustomerResponse?.customerCreate.userErrors[0]?.message ||
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
  let shopifyCustomerId = userData?.shopifyCustomerId;
  let shopifyPassword = userData?.shopifyPassword;

  // If user doesn't exist in Firestore, create them
  if (!userData) {
    console.log("🆕 Creating new social user in Firestore:", userId);

    // Generate a secure password for Shopify
    shopifyPassword = generateSecurePassword();

    // Create a customer in Shopify
    const shopifyCustomerResponse = await createCustomer(
      email,
      shopifyPassword,
      firstName,
      lastName
    );

    if (!shopifyCustomerResponse?.customerCreate.customer) {
      throw new Error("Failed to create Shopify customer");
    }

    shopifyCustomerId = shopifyCustomerResponse.customerCreate.customer.id;

    // Save user data to Firestore
    await saveUserToFirestoreAdmin(userId, {
      email,
      firstName,
      lastName,
      shopifyCustomerId,
      shopifyPassword,
    });

    // Get the newly created user data
    userData = await getUserFromFirestoreAdmin(userId);
  } else if (!userData.shopifyCustomerId || !userData.shopifyPassword) {
    // User exists but doesn't have Shopify credentials
    // This can happen if user was created before we implemented Shopify integration

    shopifyPassword = generateSecurePassword();

    // Create a customer in Shopify
    const shopifyCustomerResponse = await createCustomer(
      email,
      shopifyPassword,
      userData.firstName || firstName,
      userData.lastName || lastName
    );

    if (!shopifyCustomerResponse?.customerCreate.customer) {
      throw new Error("Failed to create Shopify customer");
    }

    shopifyCustomerId = shopifyCustomerResponse.customerCreate.customer.id;

    // Update user with Shopify credentials
    await saveUserToFirestoreAdmin(userId, {
      ...userData,
      shopifyCustomerId,
      shopifyPassword,
    });

    // Get updated user data
    userData = await getUserFromFirestoreAdmin(userId);
  }

  // Get a Shopify customer access token
  const shopifyToken = await getCustomerAccessToken(
    email,
    shopifyPassword as string
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
