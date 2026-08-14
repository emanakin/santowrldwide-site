/**
 * Super admins are seeded from existing Firebase accounts rather than managed
 * in-app, so the allowlist is the single source of truth for both the server
 * guards and the client-side nav gating.
 */
export const SUPER_ADMINS = [
  {
    uid: "hPdblGyzlGayzzWf4tB6VZkGzoY2",
    email: "zebiev5@gmail.com",
  },
  {
    uid: "z42xur9fyeXkjegvMxj0YSEdK723",
    email: "emmanuelakinlosotu12@gmail.com",
  },
] as const;

export const SUPER_ADMIN_UIDS: string[] = SUPER_ADMINS.map((a) => a.uid);

export const SUPER_ADMIN_EMAILS: string[] = SUPER_ADMINS.map((a) => a.email);

export const SUPER_ADMIN_ROLE = "super_admin";

export function isSuperAdmin(
  uid?: string | null,
  email?: string | null
): boolean {
  if (uid && SUPER_ADMIN_UIDS.includes(uid)) {
    return true;
  }

  if (email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
    return true;
  }

  return false;
}
