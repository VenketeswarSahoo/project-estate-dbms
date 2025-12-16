"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAppStore } from "../store/store";
import { User, Role } from "@/types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, login: storeLogin, logout: storeLogout } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const login = async (email: string, password?: string) => {
    const success = await storeLogin(email, password);
    if (success) {
      router.push("/dashboard");
    }
    return success;
  };

  const logout = () => {
    storeLogout();
    router.push("/");
  };

  useEffect(() => {
    if (!isMounted) return;

    const publicRoutes = ["/"];
    if (!currentUser && !publicRoutes.includes(pathname)) {
      router.push("/");
    }
  }, [currentUser, pathname, router, isMounted]);

  if (!isMounted) return null;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
