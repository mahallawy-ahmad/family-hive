"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_REWARDS } from "@/lib/types";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function ApprovalsPage() {
  const { activeMember } = useAuth();
  const { tasks, loading, approveTask, rejectTask } = useTasks(undefined, true);
  const { members } = useMembers();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!activeMember || (activeMember.role !== "admin" && activeMember.role !== "parent")) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        هذه الصفحة للمشرفين فقط
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "done");
  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleApprove = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      const result = await approveTask(taskId);
      toast.success(`✅ تمت الموافقة! حصل على ${result.pointsEarned} نقطة`);
    } catch (e: unknown) {
      toast.error("فشل الاعتماد");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setRejectComment("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedTaskId) return;
    setProcessingId(selectedTaskId);
    try {
      await rejectTask(selectedTaskId, rejectComment);
      toast.success("تم الرفض وإعادة المهمة إلى القائمة");
      setRejectDialogOpen(false);
    } catch {
      toast.error("فشل الرفض");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-500" />
          صندوق الاعتمادات
        </h1>
        <p className="text-gray-500 text-sm mt-1">المهام المنتهية وبانتظار موافقتك</p>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-3">🎉</div>
          <p className="text-gray-500 font-medium">لا توجد مهام بانتظار الاعتماد</p>
          <p className="text-gray-400 text-sm mt-1">كل شيء تمام!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => {
            const assignee = getMember(task.assignedToId);
            const reward = PRIORITY_REWARDS[task.priority] ?? task.baseReward;

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {assignee && <MemberAvatar member={assignee} size="sm" />}
                      <span className="font-semibold text-gray-800 text-lg">{task.title}</span>
                    </div>

                    {task.description && (
                      <p className="text-gray-500 text-sm mb-3">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[task.category]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-700 text-xs border-0">
                        💰 {task.baseReward} نقطة
                        {task.isProposed && " + 15 مقترحة"}
                      </Badge>
                      {assignee && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs border-0">
                          👤 {assignee.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(task.createdAt), { locale: ar, addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => handleApprove(task.id)}
                    disabled={processingId === task.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    اعتماد
                  </Button>
                  <Button
                    onClick={() => openRejectDialog(task.id)}
                    disabled={processingId === task.id}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              رفض المهمة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              سيتم إعادة المهمة إلى قائمة &quot;لم يبدأ&quot; مع تعليقك
            </p>
            <Textarea
              placeholder="سبب الرفض (اختياري)..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={3}
              dir="rtl"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={processingId !== null}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                تأكيد الرفض
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
