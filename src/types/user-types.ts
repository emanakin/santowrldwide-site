import { Timestamp } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";

// Firebase Auth User type alias
export type FirebaseAuthUser = FirebaseUser;

// Core user type for your application
export interface User {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  emailVerified?: boolean;
  shopifyCustomerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  addresses?: Address[];
  defaultAddressId?: string | null;
  // Add any other custom fields your application needs
}

// Type for creating/saving a user
export interface UserData {
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  shopifyCustomerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

// Helper function to convert Firebase Auth User to our custom User type
export function mapFirebaseUserToUser(
  firebaseUser: FirebaseAuthUser | null
): User | null {
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: null, // These will come from Firestore, not Auth
    lastLoginAt: null, // These will come from Firestore, not Auth
    shopifyCustomerId: null, // Assuming shopifyCustomerId is not available in Firebase Auth
  };
}

// Add Address type
export interface Address {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
  originalId?: string;
}
