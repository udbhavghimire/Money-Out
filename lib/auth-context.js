"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout as authLogout, isAuthenticated as checkAuth } from "@/lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  const logout = () => {
    authLogout(); // Call the logout function from auth.js
    setIsAuthenticated(false);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
