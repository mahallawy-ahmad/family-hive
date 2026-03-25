"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { TaskCard } from "@/components/tasks/TaskCard";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Flame, Trophy } from "lucide-react";

export default function FamilyPage() {
  const { activeMember } = useAuth();
  const { tasks, updateTaskStatus, deleteTask } = useTasks(undefined, true);
  const { members } = useMembers();
  const router = useRouter();

  const isParent = activeMember?.role === "admin" || activeMember?.role === "parent";

  if (!isParent) {
    router.replace("/dashboard");
    return null;
  }

  const memberMap = useMemo(() =>
    Object.fromEntries(members.map((m) => [m.id, m])),
    [members]
  );

  const tasksByMember = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    members.forEach((m) => { map[m.id] = []; });
    tasks.forEach((t) => {
      if (map[t.assignedToId]) map[t.assignedToId].push(t);
    });
    return map;
  }, [tasks, members]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">نظرة عامة على العائلة</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {members.map((m) => {
          const mt = tasksByMember[m.id] || [];
          const done = mt.filter((t) => t.status === "done" || t.status === "approved").length;
          const inProgress = mt.filter((t) => t.status === "in_progress").length;
          const todo = mt.filter((t) => t.status === "todo").length;
          const pct = mt.length > 0 ? Math.round((done / mt.length) * 100) : 0;

          return (
            <div key={m.id} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MemberAvatar member={m} size="md" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{m.name}</p>
                  <p className="text-xs text-amber-600">💰 {m.walletBalance} نقطة</p>
                </div>
              </div>
              {/* Gamification */}
              <div className="flex gap-2 mb-2 text-xs">
                <span className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-3 h-3" /> {m.currentStreak} أيام
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <Trophy className="w-3 h-3" /> مستوى {m.prestigeLevel}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-1 flex-wrap">
                  {todo > 0 && (
                    <span className={cn("px-1.5 py-0.5 rounded-full", STATUS_COLORS.todo)}>
                      {todo} {STATUS_LABELS.todo}
                    </span>
                  )}
                  {inProgress > 0 && (
                    <span className={cn("px-1.5 py-0.5 rounded-full", STATUS_COLORS.in_progress)}>
                      {inProgress} جاري
                    </span>
                  )}
                  {done > 0 && (
                    <span className={cn("px-1.5 py-0.5 rounded-full", STATUS_COLORS.done)}>
                      {done} منتهي
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-gray-400 text-right">{pct}% مكتمل</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-member task list */}
      {members.length > 0 && (
        <Tabs defaultValue={members[0]?.id || ""}>
          <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
            {members.map((m) => (
              <TabsTrigger key={m.id} value={m.id} className="flex-1 text-xs min-w-fit">
                {m.name}
                {tasksByMember[m.id]?.filter((t) => t.status !== "done" && t.status !== "approved").length > 0 && (
                  <span className="mr-1 bg-amber-500 text-white rounded-full text-xs w-4 h-4 inline-flex items-center justify-center">
                    {tasksByMember[m.id].filter((t) => t.status !== "done" && t.status !== "approved").length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {members.map((m) => (
            <TabsContent key={m.id} value={m.id} className="space-y-3 mt-4">
              {(tasksByMember[m.id] || []).length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد مهام</p>
              ) : (
                (tasksByMember[m.id] || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    member={memberMap[task.assignedToId]}
                    canDelete={activeMember?.role === "admin"}
                    onStatusChange={(s: TaskStatus) => updateTaskStatus(task.id, s)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
