import { auth } from "@/lib/firebase/client/firebaseApp";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
} from "firebase/auth";
import { SocialProvider } from "@/types/firebase-types";

/**
 * Sign in with email/password.
 * Calls your API endpoint, then signs in.
 */
export async function loginWithEmailService(
  email: string,
  password: string
): Promise<void> {
  // Call your API endpoint first to validate and get user data
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  // Store the additional user metadata temporarily
  if (data.metadata) {
    localStorage.setItem("userData", JSON.stringify(data.metadata));
  }

  // Sign in with Firebase to update client-side auth state
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with a social provider.
 * Uses the appropriate Firebase social method.
 */
export async function socialLoginService(
  provider: SocialProvider
): Promise<void> {
  // Create the auth provider
  let authProvider;
  if (provider === "google") {
    authProvider = new GoogleAuthProvider();
  } else if (provider === "facebook") {
    authProvider = new FacebookAuthProvider();
  } else {
    throw new Error("Unsupported provider");
  }

  // Sign in with popup first
  const result = await signInWithPopup(auth, authProvider);

  // Get the Firebase ID token
  const idToken = await result.user.getIdToken();

  // Sync Shopify/Firestore after Firebase auth. Failures here must not
  // keep the login panel open — the user is already authenticated.
  try {
    const response = await fetch("/api/auth/social-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Social auth backend failed:", data.error);
      return;
    }

    if (data.metadata) {
      localStorage.setItem("userData", JSON.stringify(data.metadata));
    }
  } catch (error) {
    console.error("Social auth backend failed:", error);
  }
}

/**
 * Sign up with email/password.
 * Calls your API endpoint, then signs in.
 */
export async function signupWithEmailService(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<void> {
  // Call API endpoint to create the account
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  // Store user metadata if provided
  if (data.metadata) {
    localStorage.setItem("userData", JSON.stringify(data.metadata));
  }

  // Automatically sign in the user with Firebase
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign up (or login) using a social provider.
 * Same Firebase ID-token flow as login — Google OAuth tokens are not valid
 * for adminAuth.verifyIdToken and would fail after the popup already succeeded.
 */
export async function socialSignupService(
  provider: SocialProvider
): Promise<void> {
  return socialLoginService(provider);
}

/**
 * Handles the complete logout process.
 * Clears both Firebase auth state and server-side cookies.
 */
export async function logoutService(): Promise<void> {
  // Call the server logout endpoint to clear cookies
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Server logout failed");
  }

  // Clear local storage
  localStorage.removeItem("userData");

  // Sign out from Firebase
  await signOut(auth);
}
