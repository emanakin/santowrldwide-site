import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserFromFirestore, saveUserToFirestore } from "@/lib/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    // Fetch additional user details from Firestore
    let userData = await getUserFromFirestore(userId);

    // If user doesn't exist in Firestore, create them
    if (!userData) {
      console.log("🆕 Creating missing user in Firestore:", userId);
      await saveUserToFirestore(userId, userCredential.user.email || "");

      // Get the newly created user data
      userData = await getUserFromFirestore(userId);
    }

    return NextResponse.json({ user: userCredential.user, metadata: userData });
  } catch (error: unknown) {
    const formattedError = handleFirebaseAuthError(error);
    return NextResponse.json(formattedError, { status: 400 });
  }
}
