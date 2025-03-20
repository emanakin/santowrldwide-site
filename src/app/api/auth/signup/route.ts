import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { handleFirebaseAuthError } from "@/utils/error-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return NextResponse.json({ user: userCredential.user });
  } catch (error: unknown) {
    const apiError = handleFirebaseAuthError(error);
    return NextResponse.json(apiError, { status: 400 });
  }
}
