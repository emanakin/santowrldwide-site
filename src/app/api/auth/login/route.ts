import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  getUserFromFirestore,
  saveUserToFirestore,
} from "@/lib/firebase/client/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { generateSecurePassword } from "@/lib/shopify/utils";
import { getCustomerAccessToken } from "@/lib/shopify/customers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    // Fetch additional user details from Firestore
    let userData = await getUserFromFirestore(userId);

    // If user doesn't exist in Firestore (first time login with social provider), create them
    if (!userData) {
      console.log("🆕 Creating missing user in Firestore:", userId);
      await saveUserToFirestore(userId, {
        email: userCredential.user.email || "",
      });

      // Get the newly created user data
      userData = await getUserFromFirestore(userId);
    }

    if (!userData) {
      throw new Error("User data not found");
    }

    // If we don't have a shopifyPassword stored, generate one
    const shopifyPassword =
      userData.shopifyPassword || generateSecurePassword();

    // If shopifyPassword wasn't in the database, save it now
    if (!userData.shopifyPassword) {
      await saveUserToFirestore(userId, {
        ...userData,
        shopifyPassword,
      });
    }

    // Get a Shopify customer access token using the Storefront API
    const shopifyToken = await getCustomerAccessToken(
      userData.email || "",
      shopifyPassword
    );

    // Set the token in an HttpOnly cookie
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
    const formattedError = handleFirebaseAuthError(error);
    return NextResponse.json(formattedError, { status: 400 });
  }
}
