"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { activeMember, loading } = useAuth();
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && !activeMember) {
      router.replace("/select-profile");
    } else if (status === "authenticated" && activeMember) {
      router.replace("/dashboard");
    }
  }, [loading, status, activeMember, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">جاري التحميل...</div>
    </div>
  );
}
