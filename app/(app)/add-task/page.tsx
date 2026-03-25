"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import type { TaskCategory, TaskPriority, RecurringType } from "@/lib/types";
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_REWARDS } from "@/lib/types";
import { toast } from "sonner";

export default function AddTaskPage() {
  const router = useRouter();
  const { activeMember } = useAuth();
  const { addTask } = useTasks();
  const { members } = useMembers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState(activeMember?.id || "");
  const [category, setCategory] = useState<TaskCategory>("home");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>("weekly");
  const [isProposed, setIsProposed] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseReward = PRIORITY_REWARDS[priority];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;
    setLoading(true);
    try {
      await addTask({
        title,
        description: description || undefined,
        assignedToId,
        createdById: activeMember.id,
        category,
        priority,
        baseReward,
        isProposed,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
      });
      toast.success("✅ تمت إضافة المهمة");
      router.push("/my-tasks");
    } catch (e: unknown) {
      toast.error("فشلت الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg" dir="rtl">
      <h1 className="text-xl font-bold text-gray-800">إضافة مهمة جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">عنوان المهمة *</Label>
          <Input
            id="title"
            placeholder="مثال: مذاكرة الرياضيات"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="desc">تفاصيل (اختياري)</Label>
          <Textarea
            id="desc"
            placeholder="أي تفاصيل إضافية..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Assign to */}
        <div className="space-y-1.5">
          <Label>تكليف لـ</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAssignedToId(m.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                  assignedToId === m.id
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MemberAvatar member={m} size="sm" />
                <span className="font-medium truncate">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>الفئة</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [TaskCategory, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>الأولوية والمكافأة</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v} — 💰 {PRIORITY_REWARDS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reward preview */}
        <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 flex items-center gap-2">
          💰 مكافأة هذه المهمة: <strong>{baseReward} نقطة</strong>
          {isProposed && <span className="text-xs">(+15 مقترحة عند الاعتماد)</span>}
        </div>

        {/* Due date + time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">تاريخ الانتهاء (اختياري)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              dir="ltr"
            />
          </div>
          {dueDate && (
            <div className="space-y-1.5">
              <Label htmlFor="dueTime">الوقت (اختياري)</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* Proposed task (child suggesting) */}
        {activeMember?.role === "child" && (
          <label className="flex items-center gap-2 cursor-pointer bg-purple-50 p-3 rounded-xl">
            <input
              type="checkbox"
              checked={isProposed}
              onChange={(e) => setIsProposed(e.target.checked)}
              className="rounded"
            />
            <div>
              <span className="text-sm font-medium text-purple-700">مهمة مقترحة</span>
              <p className="text-xs text-purple-500">ستحصل على +15 نقطة إضافية عند اعتمادها</p>
            </div>
          </label>
        )}

        {/* Recurring */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">مهمة متكررة</span>
          </label>
          {isRecurring && (
            <Select value={recurringType} onValueChange={(v) => setRecurringType(v as RecurringType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومياً</SelectItem>
                <SelectItem value="weekly">أسبوعياً</SelectItem>
                <SelectItem value="monthly">شهرياً</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            className="flex-1 bg-amber-500 hover:bg-amber-600"
            disabled={loading || !title.trim() || !assignedToId}
          >
            {loading ? "جاري الإضافة..." : "إضافة المهمة"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
