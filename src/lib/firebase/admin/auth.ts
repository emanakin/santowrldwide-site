import { getAuth } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase/admin/firebaseAdmin";
import { isSuperAdmin } from "@/lib/auth/superAdmins";

// Helper to verify Firebase ID token
export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return null;
  }
}

export interface AuthedAdmin {
  uid: string;
  email: string | null;
}

/**
 * Verifies the caller's Firebase ID token and confirms they are on the
 * super admin allowlist. Returns null for anything that fails either check.
 */
export async function requireSuperAdmin(
  request: Request
): Promise<AuthedAdmin | null> {
  if (!adminAuth) {
    console.error("Firebase Admin SDK unavailable, rejecting admin request");
    return null;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email ?? null;

    if (!isSuperAdmin(decodedToken.uid, email)) {
      return null;
    }

    return { uid: decodedToken.uid, email };
  } catch (error) {
    console.error("Error verifying super admin token:", error);
    return null;
  }
}
