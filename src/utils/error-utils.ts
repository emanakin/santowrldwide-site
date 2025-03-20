import {
  FirebaseAuthError,
  FirebaseAuthErrorCode,
  ApiError,
} from "@/types/firebase-types";

// Convert Firebase auth errors to user-friendly API error format
export function handleFirebaseAuthError(error: unknown): ApiError {
  // Cast the error to our FirebaseAuthError type if it's from Firebase
  const firebaseError = error as FirebaseAuthError;

  // If it has a code property, it's likely a Firebase error
  if (firebaseError?.code) {
    return getFirebaseAuthErrorMessage(firebaseError);
  }

  // Handle generic errors
  return {
    error:
      error instanceof Error ? error.message : "An unexpected error occurred",
  };
}

// Convert Firebase auth errors to more user-friendly messages
export function getFirebaseAuthErrorMessage(
  error: FirebaseAuthError
): ApiError {
  const errorCode = error.code;

  switch (errorCode) {
    case FirebaseAuthErrorCode.EMAIL_ALREADY_IN_USE:
      return {
        error:
          "This email is already registered. Please log in or use a different email.",
        code: errorCode,
        field: "email",
      };
    case FirebaseAuthErrorCode.INVALID_EMAIL:
      return {
        error: "Please enter a valid email address.",
        code: errorCode,
        field: "email",
      };
    case FirebaseAuthErrorCode.WEAK_PASSWORD:
      return {
        error: "Password should be at least 6 characters.",
        code: errorCode,
        field: "password",
      };
    case FirebaseAuthErrorCode.USER_NOT_FOUND:
      if (
        error.message?.includes("password") ||
        error.message?.includes("reset")
      ) {
        return {
          error:
            "If an account exists with this email, a password reset link will be sent.",
          code: errorCode,
        };
      } else {
        return {
          error: "Invalid email or password.",
          code: errorCode,
        };
      }
    case FirebaseAuthErrorCode.WRONG_PASSWORD:
      return {
        error: "Invalid email or password.",
        code: errorCode,
      };
    case FirebaseAuthErrorCode.POPUP_CLOSED_BY_USER:
      return {
        error: "Login was canceled. Please try again.",
        code: errorCode,
      };
    case FirebaseAuthErrorCode.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
      return {
        error:
          "An account already exists with the same email address but different sign-in credentials.",
        code: errorCode,
        field: "email",
      };
    default:
      return {
        error:
          error.message || "An unexpected error occurred. Please try again.",
        code: errorCode,
      };
  }
}
