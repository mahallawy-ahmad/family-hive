"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/hooks/useMembers";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import type { Member, Role } from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/types";
import { toast } from "sonner";

const EMOJIS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👑", "🌟", "⭐", "🐝", "🦁"];

export default function SettingsPage() {
  const { activeMember } = useAuth();
  const { members, addMember, deleteMember, changePin } = useMembers();
  const router = useRouter();

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addRole, setAddRole] = useState<Role>("child");
  const [addPin, setAddPin] = useState("");
  const [addColor, setAddColor] = useState(AVATAR_COLORS[0]);
  const [addEmoji, setAddEmoji] = useState("👦");
  const [addLoading, setAddLoading] = useState(false);

  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editPin, setEditPin] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  if (activeMember?.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  const handleAdd = async () => {
    if (!addName || addPin.length < 4) return;
    setAddLoading(true);
    try {
      await addMember({ name: addName, role: addRole, pin: addPin, avatar: addEmoji, color: addColor });
      toast.success(`✅ تمت إضافة ${addName}`);
      setAddName(""); setAddRole("child"); setAddPin(""); setShowAdd(false);
    } catch {
      toast.error("فشلت الإضافة");
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!editMember || editPin.length < 4) return;
    setEditLoading(true);
    try {
      await changePin(editMember.id, editPin);
      toast.success("تم تغيير الرقم السري");
      setEditMember(null);
      setEditPin("");
    } catch {
      toast.error("فشل تغيير الرقم السري");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (m: Member) => {
    if (!confirm(`هل تريد حذف ${m.name}؟ سيتم حذف كل مهامه وبياناته.`)) return;
    try {
      await deleteMember(m.id);
      toast.success("تم الحذف");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="space-y-6 max-w-lg" dir="rtl">
      <h1 className="text-xl font-bold text-gray-800">إدارة العائلة</h1>

      {/* Members list */}
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MemberAvatar member={m} size="lg" />

              <div className="flex-1">
                <p className="font-semibold text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-500">
                  {m.role === "admin" ? "👑 أدمن" : m.role === "parent" ? "🌟 والد/ة" : "⭐ ولد"}
                  <span className="mr-2 text-amber-600">💰 {m.walletBalance} نقطة</span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => { setEditMember(m); setEditPin(""); }}
                >
                  PIN
                </Button>
                {m.id !== activeMember?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(m)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add member button */}
      {!showAdd ? (
        <Button
          onClick={() => setShowAdd(true)}
          variant="outline"
          className="w-full border-dashed gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة فرد جديد
        </Button>
      ) : (
        <div className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">فرد جديد</h2>
          <div className="space-y-1.5">
            <Label>الاسم</Label>
            <Input
              placeholder="اسم الفرد"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>الدور</Label>
            <Select value={addRole} onValueChange={(v) => setAddRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">والد/ة</SelectItem>
                <SelectItem value="child">ولد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الرقم السري (4-6 أرقام)</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••"
              value={addPin}
              onChange={(e) => setAddPin(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label>الأيقونة</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAddEmoji(emoji)}
                  className={`text-2xl p-1.5 rounded-lg border ${
                    addEmoji === emoji ? "border-amber-500 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>اللون</Label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAddColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    addColor === c ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={addLoading || !addName || addPin.length < 4}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              {addLoading ? "جاري الإضافة..." : "إضافة"}
            </Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Edit PIN dialog */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تغيير الرقم السري لـ {editMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>الرقم السري الجديد (4-6 أرقام)</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••"
                value={editPin}
                onChange={(e) => setEditPin(e.target.value)}
                dir="ltr"
                autoFocus
              />
            </div>
            <Button
              onClick={handleUpdatePin}
              disabled={editLoading || editPin.length < 4}
              className="w-full"
            >
              {editLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
