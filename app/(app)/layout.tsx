"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { activeMember, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !activeMember) {
      router.replace("/select-profile");
    }
  }, [loading, status, activeMember, router]);

  if (loading || status === "loading" || !activeMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Navbar />
      <main className="pt-14 pb-16 md:pb-0 md:pr-56 min-h-screen bg-gray-50">
        <div className="p-4 md:p-6 max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
