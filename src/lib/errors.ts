// Firebase Auth error structure
export interface FirebaseAuthError extends Error {
  code: string;
  customData?: {
    email?: string;
  };
}

// API response error type
export interface ApiError {
  error: string;
  code?: string;
  field?: string;
}

// Convert Firebase auth errors to more user-friendly messages
export function getFirebaseAuthErrorMessage(
  error: FirebaseAuthError
): ApiError {
  const errorCode = error.code;

  switch (errorCode) {
    case "auth/email-already-in-use":
      return {
        error:
          "This email is already registered. Please log in or use a different email.",
        code: errorCode,
        field: "email",
      };
    case "auth/invalid-email":
      return {
        error: "Please enter a valid email address.",
        code: errorCode,
        field: "email",
      };
    case "auth/weak-password":
      return {
        error: "Password should be at least 6 characters.",
        code: errorCode,
        field: "password",
      };
    case "auth/user-not-found":
    case "auth/wrong-password":
      return {
        error: "Invalid email or password.",
        code: errorCode,
      };
    default:
      return {
        error:
          error.message || "An unexpected error occurred. Please try again.",
        code: errorCode,
      };
  }
}
