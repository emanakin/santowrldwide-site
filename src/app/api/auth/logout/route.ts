import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Note: Firebase signOut happens client-side
    // Here we just clear the Shopify cookie

    // Create a response that indicates success
    const response = NextResponse.json({ success: true });

    // Clear the Shopify customer token cookie
    response.cookies.set({
      name: "shopify_customer_token",
      value: "",
      expires: new Date(0), // Expire immediately
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("❌ Error in logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 400 });
  }
}
