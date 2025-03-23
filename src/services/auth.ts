import { auth } from "@/lib/firebase/client/firebaseApp";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  getGoogleAuthToken,
  getFacebookAuthToken,
} from "@/lib/firebase/client/auth";
import { SocialProvider } from "@/types/firebase-types";

/**
 * Sign in with email/password.
 * Calls your API endpoint, then signs in.
 */
export async function loginWithEmailService(
  email: string,
  password: string
): Promise<void> {
  // Call your API endpoint to get the Firebase auth token (or perform extra validation)
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // You can throw an error with a proper message
    throw new Error(data.error || "Login failed");
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
  let idToken: string | undefined;

  // Get the idToken from the appropriate provider
  if (provider === "google") {
    idToken = await getGoogleAuthToken();
  } else if (provider === "facebook") {
    idToken = await getFacebookAuthToken();
  }

  if (!idToken) {
    throw new Error("Authentication failed. Please try again.");
  }

  // Call your API endpoint for social auth
  const response = await fetch("/api/auth/social-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, idToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Social login failed");
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
    // Throw an error; the component can catch this to show field or general errors
    throw new Error(data.error || "Signup failed");
  }

  // Automatically sign in the user with Firebase
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign up (or login) using a social provider.
 * Uses the appropriate Firebase social method.
 */
export async function socialSignupService(
  provider: SocialProvider
): Promise<void> {
  let idToken: string | undefined;

  // Get the idToken from the appropriate provider
  if (provider === "google") {
    idToken = await getGoogleAuthToken();
  } else if (provider === "facebook") {
    idToken = await getFacebookAuthToken();
  } else {
    throw new Error("Unsupported social provider");
  }

  if (!idToken) {
    throw new Error("Failed to get authentication token.");
  }

  // Call your API endpoint to create/login the user in both systems
  const response = await fetch("/api/auth/social-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, idToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Social authentication failed");
  }
}
