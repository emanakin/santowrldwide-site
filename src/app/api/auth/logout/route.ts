import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { FirebaseAuthError, getFirebaseAuthErrorMessage } from "@/lib/errors";

export async function POST() {
  try {
    await signOut(auth);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Cast the error to our FirebaseAuthError type
    const firebaseError = error as FirebaseAuthError;
    const formattedError = getFirebaseAuthErrorMessage(firebaseError);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
