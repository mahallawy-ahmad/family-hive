"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { TaskStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyTasksPage() {
  const { activeMember } = useAuth();
  const { tasks, updateTaskStatus, deleteTask } = useTasks(activeMember?.id);
  const { members } = useMembers();
  const [activeTab, setActiveTab] = useState<TaskStatus | "all">("all");

  const memberMap = useMemo(() =>
    Object.fromEntries(members.map((m) => [m.id, m])),
    [members]
  );

  const filtered = useMemo(() =>
    activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab),
    [tasks, activeTab]
  );

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    approved: tasks.filter((t) => t.status === "approved").length,
  }), [tasks]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">مهامي</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskStatus | "all")}>
        <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="all" className="flex-1 text-xs">الكل ({counts.all})</TabsTrigger>
          <TabsTrigger value="todo" className="flex-1 text-xs">{STATUS_LABELS.todo} ({counts.todo})</TabsTrigger>
          <TabsTrigger value="in_progress" className="flex-1 text-xs">{STATUS_LABELS.in_progress} ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="done" className="flex-1 text-xs">{STATUS_LABELS.done} ({counts.done})</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 text-xs">✅ معتمد ({counts.approved})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد مهام</p>
              <Link href="/add-task">
                <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600">+ أضف مهمة</Button>
              </Link>
            </div>
          ) : (
            filtered.map((task) => (
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
      </Tabs>
    </div>
  );
}
