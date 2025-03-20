"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  showLoginPanel: boolean;
  showSignupPanel: boolean;
  setShowLoginPanel: (show: boolean) => void;
  setShowSignupPanel: (show: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  showLoginPanel: false,
  showSignupPanel: false,
  setShowLoginPanel: () => {},
  setShowSignupPanel: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showSignupPanel, setShowSignupPanel] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
    if (showLoginPanel || showSignupPanel) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [showLoginPanel, showSignupPanel]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showLoginPanel,
        showSignupPanel,
        setShowLoginPanel,
        setShowSignupPanel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
