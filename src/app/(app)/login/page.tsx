"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { setShowLoginPanel } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setShowLoginPanel(true);

    const previousPage = window.document.referrer;

    // Check if referrer is from the same origin (our website)
    const isSameOrigin =
      previousPage &&
      (previousPage.startsWith(window.location.origin) ||
        previousPage.startsWith("/"));

    if (!isSameOrigin || previousPage === "") {
      router.replace("/");
    } else {
      router.back();
    }
  }, [setShowLoginPanel, router]);

  return null;
}
