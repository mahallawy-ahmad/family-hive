"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckSquare, Clock, AlertCircle, Zap, Megaphone, Flame, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { TaskCard } from "@/components/tasks/TaskCard";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { Button } from "@/components/ui/button";
import { PRESTIGE_THRESHOLD, canPrestige } from "@/lib/gamification";
import type { TaskStatus } from "@/lib/types";

export default function DashboardPage() {
  const { activeMember } = useAuth();
  const { tasks, updateTaskStatus, deleteTask } = useTasks(activeMember?.id);
  const { members } = useMembers();
  const { announcements, markRead } = useAnnouncements(activeMember?.id);

  const myTasks = useMemo(() =>
    tasks.filter((t) => t.status !== "approved" && t.status !== "rejected"),
    [tasks]
  );

  const todayTasks = useMemo(() => {
    const today = new Date();
    return myTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    });
  }, [myTasks]);

  const overdueTasks = useMemo(() =>
    myTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }),
    [myTasks]
  );

  const unreadAnnouncements = announcements.filter((a) => !a.isRead);

  const memberMap = useMemo(() =>
    Object.fromEntries(members.map((m) => [m.id, m])),
    [members]
  );

  const isParent = activeMember?.role === "admin" || activeMember?.role === "parent";
  const prestigeProgress = activeMember
    ? Math.min((activeMember.lifetimePoints / PRESTIGE_THRESHOLD) * 100, 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Greeting + Stats bar */}
      <div className="bg-gradient-to-l from-amber-50 to-yellow-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          {activeMember && <MemberAvatar member={activeMember} size="lg" />}
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              أهلاً، {activeMember?.name} 👋
            </h1>
            <p className="text-xs text-gray-500">
              {new Intl.DateTimeFormat("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(new Date())}
            </p>
          </div>
        </div>

        {/* Gamification stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-amber-600">💰 {activeMember?.walletBalance ?? 0}</div>
            <div className="text-xs text-gray-500">رصيد النقاط</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5" /> {activeMember?.currentStreak ?? 0}
            </div>
            <div className="text-xs text-gray-500">أيام متتالية</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="text-xl font-bold text-purple-600 flex items-center justify-center gap-1">
              <Trophy className="w-5 h-5" /> {activeMember?.prestigeLevel ?? 0}
            </div>
            <div className="text-xs text-gray-500">مستوى الارتقاء</div>
          </div>
        </div>

        {/* Prestige progress bar */}
        {activeMember?.role === "child" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>تقدم الارتقاء</span>
              <span>{activeMember.lifetimePoints} / {PRESTIGE_THRESHOLD}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full transition-all"
                style={{ width: `${prestigeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border">
          <div className="text-2xl font-bold text-blue-600">{myTasks.length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" /> نشطة
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border">
          <div className="text-2xl font-bold text-orange-500">{todayTasks.length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" /> اليوم
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center border">
          <div className="text-2xl font-bold text-red-500">{overdueTasks.length}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> متأخرة
          </div>
        </div>
      </div>

      {/* Announcements */}
      {unreadAnnouncements.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-orange-500" />
            إعلانات جديدة ({unreadAnnouncements.length})
          </h2>
          {unreadAnnouncements.slice(0, 2).map((a) => (
            <div
              key={a.id}
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer"
              onClick={() => activeMember && markRead(a.id, activeMember.id)}
            >
              <p className="font-semibold text-orange-800">{a.title}</p>
              <p className="text-sm text-orange-700 mt-1">{a.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Today's tasks */}
      {todayTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> مهام اليوم
          </h2>
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              member={memberMap[task.assignedToId]}
              canDelete={activeMember?.role === "admin"}
              onStatusChange={(s: TaskStatus) => updateTaskStatus(task.id, s)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Family overview for parents */}
      {isParent && (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">نظرة عامة على العائلة</h2>
            <Link href="/family">
              <Button variant="ghost" size="sm" className="text-amber-600 text-xs">عرض الكل</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {members
              .filter((m) => m.role === "child")
              .map((child) => {
                const childTasks = tasks.filter((t) => t.assignedToId === child.id);
                const done = childTasks.filter((t) => t.status === "done" || t.status === "approved").length;
                const total = childTasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={child.id} className="flex items-center gap-3">
                    <MemberAvatar member={child} size="sm" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{child.name}</span>
                        <span className="text-gray-500 text-xs">{done}/{total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-amber-600 font-bold">💰 {child.walletBalance}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      {myTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">مهامي الأخيرة</h2>
            <Link href="/my-tasks">
              <Button variant="ghost" size="sm" className="text-amber-600 text-xs">عرض الكل</Button>
            </Link>
          </div>
          {myTasks.slice(0, 3).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              member={memberMap[task.assignedToId]}
              canDelete={activeMember?.role === "admin"}
              onStatusChange={(s: TaskStatus) => updateTaskStatus(task.id, s)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {myTasks.length === 0 && unreadAnnouncements.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مهام نشطة</p>
          <Link href="/add-task">
            <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600">+ أضف مهمة</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
