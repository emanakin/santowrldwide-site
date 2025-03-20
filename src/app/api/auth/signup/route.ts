import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { saveUserToFirestore } from "@/lib/firestore";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Create Firebase Auth User
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    console.log("✅ Firebase User Created:", userId);

    // Save User to Firestore
    await saveUserToFirestore(userId, email);

    return NextResponse.json({ user: userCredential.user });
  } catch (error: unknown) {
    console.error("❌ Error in Signup:", error);
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
