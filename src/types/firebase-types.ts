// Firebase Auth User type
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};

// Firebase Auth error structure
export interface FirebaseAuthError extends Error {
  code: string;
  customData?: {
    email?: string;
  };
}

// Common Firebase Auth error codes
export enum FirebaseAuthErrorCode {
  EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",
  INVALID_EMAIL = "auth/invalid-email",
  WEAK_PASSWORD = "auth/weak-password",
  USER_NOT_FOUND = "auth/user-not-found",
  WRONG_PASSWORD = "auth/wrong-password",
  POPUP_CLOSED_BY_USER = "auth/popup-closed-by-user",
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = "auth/account-exists-with-different-credential",
  INVALID_CREDENTIAL = "auth/invalid-credential",
  OPERATION_NOT_ALLOWED = "auth/operation-not-allowed",
  USER_DISABLED = "auth/user-disabled",
  TOO_MANY_REQUESTS = "auth/too-many-requests",
  REQUIRES_RECENT_LOGIN = "auth/requires-recent-login",
  MISSING_CONTINUE_URI = "auth/missing-continue-uri",
  INVALID_CONTINUE_URI = "auth/invalid-continue-uri",
  MISSING_ANDROID_PACKAGE_NAME = "auth/missing-android-pkg-name",
  UNAUTHORIZED_CONTINUE_URI = "auth/unauthorized-continue-uri",
  INVALID_ACTION_CODE = "auth/invalid-action-code",
  EXPIRED_ACTION_CODE = "auth/expired-action-code",
}

// API response error type
export interface ApiError {
  error: string;
  code?: string;
  field?: string;
}

// Social login providers
export type SocialProvider = "google" | "facebook";
