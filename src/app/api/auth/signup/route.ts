import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebaseApp";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/firebase/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { createShopifyCustomer } from "@/lib/shopify/admin/customer";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // First, create the Shopify customer
    const shopifyCustomer = await createShopifyCustomer(
      email,
      firstName,
      lastName
    );

    if (!shopifyCustomer) {
      return NextResponse.json(
        { error: "Failed to create Shopify customer" },
        { status: 400 }
      );
    }

    console.log("✅ Shopify Customer Created:", shopifyCustomer.id);

    // Extract the numeric ID from Shopify's gid
    const shopifyCustomerId = shopifyCustomer.id.replace(
      "gid://shopify/Customer/",
      ""
    );

    // Create Firebase Auth User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    console.log("✅ Firebase User Created:", userId);

    // Save User to Firestore with the Shopify customer ID
    const userData = {
      email,
      firstName,
      lastName,
      shopifyCustomerId,
    };

    await saveUserToFirestore(userId, userData);

    return NextResponse.json({
      user: userCredential.user,
      shopifyCustomerId,
    });
  } catch (error: unknown) {
    console.error("❌ Error in Signup:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
