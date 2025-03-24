"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { onAuthStateChanged } from "firebase/auth";
import { User, mapFirebaseUserToUser } from "@/types/user-types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  showLoginPanel: boolean;
  showSignupPanel: boolean;
  showResetPanel: boolean;
  setUser: (user: User | null) => void;
  setShowLoginPanel: (show: boolean) => void;
  setShowSignupPanel: (show: boolean) => void;
  setShowResetPanel: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showLoginPanel: false,
  showSignupPanel: false,
  showResetPanel: false,
  setUser: () => {},
  setShowLoginPanel: () => {},
  setShowSignupPanel: () => {},
  setShowResetPanel: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);
  const [showResetPanel, setShowResetPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Convert Firebase Auth User to our custom User type
      setUser(mapFirebaseUserToUser(firebaseUser));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // When one panel opens, close the other
  useEffect(() => {
    if (showLoginPanel) setShowSignupPanel(false);
  }, [showLoginPanel]);

  useEffect(() => {
    if (showSignupPanel) setShowLoginPanel(false);
  }, [showSignupPanel]);

  // Control body scroll when panels are open
  useEffect(() => {
    if (showLoginPanel || showSignupPanel || showResetPanel) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [showLoginPanel, showSignupPanel, showResetPanel]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showLoginPanel,
        showSignupPanel,
        showResetPanel,
        setUser,
        setShowLoginPanel,
        setShowSignupPanel,
        setShowResetPanel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
