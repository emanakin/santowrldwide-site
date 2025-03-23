import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/client/firebaseApp";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  saveUserToFirestore,
  getUserFromFirestore,
} from "@/lib/firebase/client/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { generateSecurePassword } from "@/lib/shopify/utils";
import {
  createCustomer,
  getCustomerAccessToken,
} from "@/lib/shopify/customers";

export async function POST(request: Request) {
  try {
    const { provider, idToken } = await request.json();

    // Create the appropriate credential based on the provider
    let credential;
    if (provider === "google") {
      credential = GoogleAuthProvider.credential(idToken);
    } else if (provider === "facebook") {
      credential = FacebookAuthProvider.credential(idToken);
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    // Sign in with the credential
    const userCredential = await signInWithCredential(auth, credential);
    const userId = userCredential.user.uid;
    const email = userCredential.user.email || "";

    // Initial display name from provider (may be null)
    const displayName = userCredential.user.displayName || "";

    // Split display name into first and last name (if available)
    let firstName = "";
    let lastName = "";

    if (displayName) {
      const nameParts = displayName.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    // Check if user exists in Firestore
    let userData = await getUserFromFirestore(userId);
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
        return NextResponse.json(
          { error: "Failed to create Shopify customer" },
          { status: 400 }
        );
      }

      shopifyCustomerId = shopifyCustomerResponse.customerCreate.customer.id;

      // Save user data to Firestore
      await saveUserToFirestore(userId, {
        email,
        firstName,
        lastName,
        shopifyCustomerId,
        shopifyPassword,
      });

      // Get the newly created user data
      userData = await getUserFromFirestore(userId);
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
        return NextResponse.json(
          { error: "Failed to create Shopify customer" },
          { status: 400 }
        );
      }

      shopifyCustomerId = shopifyCustomerResponse.customerCreate.customer.id;

      // Update user with Shopify credentials
      await saveUserToFirestore(userId, {
        ...userData,
        shopifyCustomerId,
        shopifyPassword,
      });

      // Get updated user data
      userData = await getUserFromFirestore(userId);
    }

    // Get a Shopify customer access token
    const shopifyToken = await getCustomerAccessToken(
      email,
      shopifyPassword as string
    );

    // Create response with token cookie
    const response = NextResponse.json({
      user: userCredential.user,
      metadata: userData,
    });

    response.cookies.set({
      name: "shopify_customer_token",
      value: shopifyToken.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(shopifyToken.expiresAt),
    });

    return response;
  } catch (error: unknown) {
    console.error("❌ Error in social auth:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
