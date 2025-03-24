import { NextResponse } from "next/server";
import { handleFirebaseAuthError } from "@/utils/error-utils";
import { socialAuthUser } from "@/services/api/auth";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    try {
      // Call the service function
      const { user, metadata, shopifyToken } = await socialAuthUser(idToken);

      // Create response with token cookie
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
      console.error("Social Auth Error:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Social authentication failed",
        },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.error("❌ Error in social auth:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
