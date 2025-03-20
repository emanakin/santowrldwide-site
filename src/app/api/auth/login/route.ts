import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return NextResponse.json({ user: userCredential.user });
  } catch (error: unknown) {
    const formattedError = handleFirebaseAuthError(error);
    return NextResponse.json(formattedError, { status: 400 });
  }
}
