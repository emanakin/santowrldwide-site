import { getAuth } from "firebase-admin/auth";

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
