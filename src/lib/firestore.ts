import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Function to Save User Data in Firestore
export async function saveUserToFirestore(userId: string, email: string) {
  try {
    console.log("🔥 Attempting to save user in Firestore...");

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { email, createdAt: new Date() });

    console.log("✅ User saved to Firestore:", userId);
  } catch (error) {
    console.error("❌ Firestore Write Error:", error);
  }
}

// Function to Get User Data
export async function getUserFromFirestore(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      console.warn("⚠️ User not found in Firestore:", userId);
      return null;
    }

    console.log("✅ User found in Firestore:", userDoc.data());
    return userDoc.data();
  } catch (error) {
    console.error("❌ Firestore Read Error:", error);
    throw error;
  }
}
