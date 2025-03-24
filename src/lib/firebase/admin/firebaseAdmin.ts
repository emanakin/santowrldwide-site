import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { ServiceAccount } from "firebase-admin/app";

// Define proper types
let firebaseAdmin: App | null = null;

// Use environment variables for service account
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

try {
  const apps = getApps();

  if (apps.length === 0) {
    firebaseAdmin = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  } else {
    firebaseAdmin = apps[0];
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error);
  firebaseAdmin = null;
}

// Define proper types for exported objects
export const adminAuth: Auth | null = firebaseAdmin
  ? getAuth(firebaseAdmin)
  : null;
export const adminDb: Firestore | null = firebaseAdmin
  ? getFirestore(firebaseAdmin)
  : null;

export function isAdminSDKAvailable(): boolean {
  return !!firebaseAdmin;
}
