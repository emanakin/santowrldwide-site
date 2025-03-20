"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { setShowLoginPanel } = useAuth();

  useEffect(() => {
    setShowLoginPanel(true);
  }, [setShowLoginPanel]);

  return null; // No content needed - just trigger the panel
}
