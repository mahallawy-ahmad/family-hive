"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import type { Member } from "@/lib/types";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";

export default function SelectProfilePage() {
  const { status } = useSession();
  const { logout, setActiveMember } = useAuth();
  const { members, loading, verifyPin } = useMembers();
  const router = useRouter();
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const handleSelect = (member: Member) => {
    setSelected(member);
    setPin("");
    setError("");
  };

  const handlePinSubmit = async () => {
    if (!selected) return;
    setVerifying(true);
    setError("");
    try {
      const member = await verifyPin(selected.id, pin);
      if (member) {
        setActiveMember(member);
        router.replace("/dashboard");
      } else {
        setError("الرقم السري غير صحيح");
        setPin("");
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="خلية النحل" width={72} height={72} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">خلية النحل</h1>
          <p className="text-gray-500 text-sm mt-1">من أنت؟ اختر ملفك الشخصي</p>
        </div>

        {members.length === 0 ? (
          <div className="text-center bg-white rounded-2xl p-8 shadow">
            <p className="text-gray-500 mb-4">لا يوجد أعضاء بعد</p>
            <Button onClick={() => router.push("/settings")}>إضافة أعضاء العائلة</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className={`bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow hover:shadow-md transition-all ${
                  selected?.id === member.id ? "ring-2 ring-amber-500" : ""
                }`}
              >
                <MemberAvatar member={member} size="xl" />
                <span className="font-semibold text-gray-800">{member.name}</span>
                <span className="text-xs text-gray-400">
                  {member.role === "admin" ? "👑 أدمن" : member.role === "parent" ? "🌟 والد/ة" : "⭐ ولد"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* PIN Entry */}
        {selected && (
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-center text-gray-700 font-medium mb-4">
              أدخل الرقم السري لـ {selected.name}
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                className="text-center text-xl tracking-widest"
                dir="ltr"
                autoFocus
              />
              <Button onClick={handlePinSubmit} disabled={pin.length < 4 || verifying}>
                {verifying ? "..." : "دخول"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج من الحساب
          </button>
        </div>
      </div>
    </div>
  );
}
