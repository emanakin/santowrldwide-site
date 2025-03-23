import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/firebase/client/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { generateSecurePassword } from "@/lib/shopify/utils";
import {
  createCustomer,
  getCustomerAccessToken,
} from "@/lib/shopify/customers";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

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
      return NextResponse.json({ error }, { status: 400 });
    }

    const shopifyCustomer = shopifyCustomerResponse.customerCreate.customer;
    console.log("✅ Shopify Customer Created:", shopifyCustomer.id);

    // Create Firebase Auth User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    console.log("✅ Firebase User Created:", userId);

    // Save User to Firestore with the Shopify customer ID and password
    const userData = {
      email,
      firstName,
      lastName,
      shopifyCustomerId: shopifyCustomer.id,
      shopifyPassword,
    };

    await saveUserToFirestore(userId, userData);

    // Get a Shopify customer access token
    const shopifyToken = await getCustomerAccessToken(email, shopifyPassword);

    // Set the token in an HttpOnly cookie
    const response = NextResponse.json({
      user: userCredential.user,
      shopifyCustomerId: shopifyCustomer.id,
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
    console.error("❌ Error in Signup:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
