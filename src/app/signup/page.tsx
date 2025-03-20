"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { setShowSignupPanel } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setShowSignupPanel(true);

    const previousPage = window.document.referrer;

    // Check if referrer is from the same origin (our website)
    const isSameOrigin =
      previousPage &&
      (previousPage.startsWith(window.location.origin) ||
        previousPage.startsWith("/"));

    // If there's no valid previous page, go to home
    if (!isSameOrigin || previousPage === "") {
      router.replace("/");
    } else {
      router.back();
    }
  }, [setShowSignupPanel, router]);

  return null;
}
