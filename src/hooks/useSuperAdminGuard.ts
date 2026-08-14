"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SuperAdminGuard {
  /** True while auth is resolving or the user is being redirected away. */
  checking: boolean;
  allowed: boolean;
}

/**
 * Client-side gate for the admin model pages. The API routes enforce the same
 * allowlist server-side, so this only keeps the UI out of the wrong hands.
 */
export function useSuperAdminGuard(): SuperAdminGuard {
  const { loading, user, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isSuperAdmin) {
      router.replace("/account/orders");
    }
  }, [loading, user, isSuperAdmin, router]);

  return {
    checking: loading || !user || !isSuperAdmin,
    allowed: !loading && Boolean(user) && isSuperAdmin,
  };
}
