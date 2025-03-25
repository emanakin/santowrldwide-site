import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD;

    if (!sitePassword) {
      console.error("SITE_PASSWORD environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (password === sitePassword) {
      // Password is correct
      const response = NextResponse.json({ success: true });

      // Set a cookie to remember this user is authenticated
      response.cookies.set("site_unlocked", "true", {
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return response;
    } else {
      // Password is incorrect
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in unlock API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
