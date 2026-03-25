"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";
import type { Member } from "@/lib/types";

interface AuthContextType {
  activeMember: Member | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveMember: (member: Member | null) => void;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [activeMember, setActiveMemberState] = useState<Member | null>(null);
  const loading = status === "loading";

  // Restore active member from sessionStorage
  useEffect(() => {
    if (status === "authenticated") {
      const stored = sessionStorage.getItem("activeMember");
      if (stored) {
        try {
          setActiveMemberState(JSON.parse(stored));
        } catch {
          sessionStorage.removeItem("activeMember");
        }
      }
    } else if (status === "unauthenticated") {
      setActiveMemberState(null);
      sessionStorage.removeItem("activeMember");
    }
  }, [status]);

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) throw new Error("بيانات الدخول غير صحيحة");
  };

  const logout = async () => {
    setActiveMemberState(null);
    sessionStorage.removeItem("activeMember");
    await nextAuthSignOut({ callbackUrl: "/login" });
  };

  const handleSetActiveMember = (member: Member | null) => {
    setActiveMemberState(member);
    if (member) {
      sessionStorage.setItem("activeMember", JSON.stringify(member));
    } else {
      sessionStorage.removeItem("activeMember");
    }
  };

  const refreshMember = async () => {
    if (!activeMember) return;
    const res = await fetch("/api/members");
    if (res.ok) {
      const members: Member[] = await res.json();
      const updated = members.find((m) => m.id === activeMember.id);
      if (updated) handleSetActiveMember(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        activeMember,
        loading,
        signIn,
        logout,
        setActiveMember: handleSetActiveMember,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
