import { NextResponse } from "next/server";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { loginUser } from "@/services/api/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    try {
      // Call the service function
      const { user, metadata, shopifyToken } = await loginUser(email);

      // Set the token in an HttpOnly cookie
      const response = NextResponse.json({
        user,
        metadata,
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
      console.error("Login Error:", error);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    const formattedError = handleFirebaseAuthError(error);
    return NextResponse.json(formattedError, { status: 400 });
  }
}
