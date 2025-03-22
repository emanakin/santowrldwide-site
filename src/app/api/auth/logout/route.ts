import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { signOut } from "firebase/auth";
import { getFirebaseAuthErrorMessage } from "@/utils/error-utils";
import { FirebaseAuthError } from "@/types/firebase-types";

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
