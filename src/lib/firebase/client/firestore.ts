// lib/firebase/firestore.ts
import { db } from "./firebaseApp";
import { User, UserData, Address } from "@/types/user-types";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Save user data in Firestore
export async function saveUserToFirestore(
  userId: string,
  userData: UserData
): Promise<boolean> {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    console.log("✅ User saved to Firestore:", userId);
    return true;
  } catch (error) {
    console.error("❌ Firestore Write Error:", error);
    throw error;
  }
}

// Get user data from Firestore
export async function getUserFromFirestore(
  userId: string
): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.warn("⚠️ User not found in Firestore:", userId);
      return null;
    }
    const userData = userDoc.data();
    console.log("✅ User found in Firestore:", userData);
    return { id: userId, ...userData } as User;
  } catch (error) {
    console.error("❌ Firestore Read Error:", error);
    throw error;
  }
}

// Save user addresses to Firestore
export async function saveUserAddresses(
  userId: string,
  addresses: Address[]
): Promise<boolean> {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        addresses,
        defaultAddressId: addresses.find((addr) => addr.isDefault)?.id || null,
      },
      { merge: true }
    );
    console.log("✅ User addresses saved to Firestore:", userId);
    return true;
  } catch (error) {
    console.error("❌ Firestore Write Error:", error);
    throw error;
  }
}

// Get user addresses from Firestore
export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.warn("⚠️ User not found in Firestore:", userId);
      return [];
    }
    const userData = userDoc.data();
    return userData.addresses || [];
  } catch (error) {
    console.error("❌ Firestore Read Error:", error);
    throw error;
  }
}
