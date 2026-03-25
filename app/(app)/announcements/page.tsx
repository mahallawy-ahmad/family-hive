"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Megaphone, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const { activeMember } = useAuth();
  const { announcements, addAnnouncement, markRead } = useAnnouncements(activeMember?.id);
  const { members } = useMembers();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isParent = activeMember?.role === "admin" || activeMember?.role === "parent";

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setLoading(true);
    try {
      await addAnnouncement(title, content, activeMember.id);
      toast.success("📢 تم نشر الإعلان");
      setTitle(""); setContent(""); setShowForm(false);
    } catch {
      toast.error("فشل النشر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">الإعلانات</h1>
        {isParent && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="bg-amber-500 hover:bg-amber-600">
            {showForm ? <><X className="w-4 h-4 ml-1" /> إلغاء</> : <><Plus className="w-4 h-4 ml-1" /> إعلان جديد</>}
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && isParent && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ann-title">العنوان</Label>
            <Input
              id="ann-title"
              placeholder="عنوان الإعلان"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-content">المحتوى</Label>
            <Textarea
              id="ann-content"
              placeholder="محتوى الإعلان..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600">
            {loading ? "جاري النشر..." : "نشر الإعلان"}
          </Button>
        </form>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد إعلانات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const creator = memberMap[a.createdById];

            return (
              <div
                key={a.id}
                className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all ${
                  !a.isRead ? "border-orange-300 bg-orange-50/40" : ""
                }`}
                onClick={() => activeMember && !a.isRead && markRead(a.id, activeMember.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!a.isRead && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      )}
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mt-1.5">{a.content}</p>
                    <div className="flex items-center gap-2 mt-3">
                      {creator && <MemberAvatar member={creator} size="sm" />}
                      <span className="text-xs text-gray-400">
                        {creator?.name} · {formatDistanceToNow(new Date(a.createdAt), { locale: ar, addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
