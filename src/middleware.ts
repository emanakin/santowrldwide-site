import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyUnlockToken } from "@/lib/siteLock";

export async function middleware(request: NextRequest) {
  // Check if site is in lock mode
  const isLockModeEnabled = process.env.NEXT_PUBLIC_LOCK_MODE === "true";

  // Skip lock check for API routes and the locked page itself
  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/api") ||
    path === "/productions" ||
    path === "/locked" ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if user has the unlock cookie
  const hasUnlockCookie = await verifyUnlockToken(
    request.cookies.get("site_unlocked")?.value,
    process.env.SITE_UNLOCK_SECRET
  );

  // If lock mode is enabled and user doesn't have unlock cookie, redirect to locked page
  if (isLockModeEnabled && !hasUnlockCookie) {
    return NextResponse.redirect(new URL("/locked", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|images|videos).*)",
};
