"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { setShowSignupPanel } = useAuth();

  useEffect(() => {
    setShowSignupPanel(true);
  }, [setShowSignupPanel]);

  return null; // No content needed - just trigger the panel
}
