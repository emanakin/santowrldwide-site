import { NextResponse } from "next/server";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { registerUser } from "@/services/api/auth";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    try {
      // Call the service function
      const { user, shopifyCustomerId, shopifyToken } = await registerUser(
        email,
        password,
        firstName,
        lastName
      );

      // Set the token in an HttpOnly cookie
      const response = NextResponse.json({
        user,
        shopifyCustomerId,
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
    } catch (error) {
      console.error("Signup Error:", error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Registration failed",
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("❌ Error in Signup:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
