import { auth } from "@/lib/firebase/client/firebaseApp";

/**
 * Calls an admin API route with the caller's Firebase ID token attached.
 * The server re-checks the super admin allowlist on every request.
 */
export async function adminFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Request failed. Please try again.");
  }

  return data as T;
}
