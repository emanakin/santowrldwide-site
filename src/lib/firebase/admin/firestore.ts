import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { User, UserData } from "@/types/user-types";

/**
 * Save user data to Firestore using the Admin SDK
 */
export async function saveUserToFirestoreAdmin(
  userId: string,
  userData: UserData
) {
  if (!adminDb) {
    throw new Error("Firestore is not initialized");
  }
  return await adminDb
    .collection("users")
    .doc(userId)
    .set(userData, { merge: true });
}

/**
 * Get user data from Firestore using the Admin SDK
 */
export async function getUserFromFirestoreAdmin(userId: string) {
  if (!adminDb) {
    throw new Error("Firestore is not initialized");
  }
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }
  return userDoc.data() as User;
}
