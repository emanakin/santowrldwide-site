import { NextResponse } from "next/server";
import { createUnlockToken } from "@/lib/siteLock";
import { timingSafeEqual } from "node:crypto";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;
    const secret = process.env.SITE_UNLOCK_SECRET;

    if (!sitePassword || !secret) {
      console.error("SITE_PASSWORD environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const submitted = Buffer.from(typeof password === "string" ? password : "");
    const expected = Buffer.from(sitePassword);
    if (submitted.length === expected.length && timingSafeEqual(submitted, expected)) {
      // Password is correct
      const response = NextResponse.json({ success: true });

      // Set a cookie to remember this user is authenticated
      response.cookies.set("site_unlocked", await createUnlockToken(secret), {
        maxAge: 60 * 60, // 1 hour
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
