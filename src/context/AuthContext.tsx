"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { onAuthStateChanged } from "firebase/auth";
import { User, mapFirebaseUserToUser } from "@/types/user-types";
import { isSuperAdmin } from "@/lib/auth/superAdmins";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
  showLoginPanel: boolean;
  showSignupPanel: boolean;
  showResetPanel: boolean;
  setUser: (user: User | null) => void;
  setShowLoginPanel: (show: boolean) => void;
  setShowSignupPanel: (show: boolean) => void;
  setShowResetPanel: (show: boolean) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSuperAdmin: false,
  showLoginPanel: false,
  showSignupPanel: false,
  showResetPanel: false,
  setUser: () => {},
  setShowLoginPanel: () => {},
  setShowSignupPanel: () => {},
  setShowResetPanel: () => {},
  refreshUser: async () => {},
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

  // Function to refresh user data from server
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Get fresh user data by calling the auth state change manually
        // This will trigger the onAuthStateChanged listener
        await currentUser.reload();
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase Auth User to our custom User type
        const mappedUser = mapFirebaseUserToUser(firebaseUser);

        // If we have additional user data stored in localStorage from login, merge it
        try {
          const storedUserData = localStorage.getItem("userData");
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            // Merge stored data with Firebase user data
            const enrichedUser = {
              ...mappedUser,
              ...userData,
              id: firebaseUser.uid, // Always use Firebase UID as ID
              email: firebaseUser.email, // Always use Firebase email
            };
            setUser(enrichedUser);
          } else {
            setUser(mappedUser);
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          setUser(mappedUser);
        }
      } else {
        setUser(null);
        // Clear stored user data when user signs out
        localStorage.removeItem("userData");
      }
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

  // Enhanced setUser that also updates localStorage
  const setUserWithStorage = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      // Store additional user data (excluding sensitive info)
      const userDataToStore = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        shopifyCustomerId: newUser.shopifyCustomerId,
        displayName: newUser.displayName,
      };
      localStorage.setItem("userData", JSON.stringify(userDataToStore));
    } else {
      localStorage.removeItem("userData");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSuperAdmin: isSuperAdmin(user?.id, user?.email),
        showLoginPanel,
        showSignupPanel,
        showResetPanel,
        setUser: setUserWithStorage,
        setShowLoginPanel,
        setShowSignupPanel,
        setShowResetPanel,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
