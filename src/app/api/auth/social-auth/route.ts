import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { saveUserToFirestore, getUserFromFirestore } from "@/lib/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export async function POST(request: Request) {
  try {
    const { provider, idToken } = await request.json();

    // Create the appropriate credential based on the provider
    let credential;
    if (provider === "google") {
      credential = GoogleAuthProvider.credential(idToken);
    } else if (provider === "facebook") {
      credential = FacebookAuthProvider.credential(idToken);
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    // Sign in with the credential
    const userCredential = await signInWithCredential(auth, credential);
    const userId = userCredential.user.uid;
    const email = userCredential.user.email || "";

    // Check if user exists in Firestore
    let userData = await getUserFromFirestore(userId);

    // If user doesn't exist in Firestore, create them
    if (!userData) {
      console.log("🆕 Creating new social user in Firestore:", userId);
      await saveUserToFirestore(userId, email);

      // Get the newly created user data
      userData = await getUserFromFirestore(userId);
    }

    return NextResponse.json({
      user: userCredential.user,
      metadata: userData,
    });
  } catch (error: unknown) {
    console.error("❌ Error in social auth:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
