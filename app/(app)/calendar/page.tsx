"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/TaskCard";
import { AVATAR_COLORS } from "@/lib/types";
import type { TaskStatus } from "@/lib/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { arSA } from "date-fns/locale";

export default function CalendarPage() {
  const { activeMember } = useAuth();
  const { tasks, updateTaskStatus, deleteTask } = useTasks();
  const { members } = useMembers();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const isParent = activeMember?.role === "admin" || activeMember?.role === "parent";

  const visibleTasks = useMemo(() =>
    isParent
      ? tasks
      : tasks.filter((t) => t.assignedToId === activeMember?.id),
    [tasks, activeMember, isParent]
  );

  const memberMap = useMemo(() =>
    Object.fromEntries(members.map((m) => [m.id, m])),
    [members]
  );

  // Color map by member
  const memberColors = useMemo(() => {
    const map: Record<string, string> = {};
    members.forEach((m, i) => {
      map[m.id] = m.color || AVATAR_COLORS[i % AVATAR_COLORS.length];
    });
    return map;
  }, [members]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tasksOnDay = (day: Date) =>
    visibleTasks.filter((t) => t.dueDate && isSameDay(t.dueDate, day));

  const selectedDayTasks = selectedDay ? tasksOnDay(selectedDay) : [];

  const weekdays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">التقويم العائلي</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="font-medium text-gray-700 min-w-24 text-center">
            {format(currentMonth, "MMMM yyyy", { locale: arSA })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {weekdays.map((d) => (
            <div key={d} className="text-center text-xs text-gray-500 py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayTasks = tasksOnDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-16 p-1 border-b border-r text-left transition-colors ${
                  isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                } ${!isCurrentMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1 ${
                    isToday ? "bg-indigo-500 text-white" : "text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="w-full h-1.5 rounded-full"
                      style={{ backgroundColor: memberColors[t.assignedToId] || "#6366f1" }}
                      title={t.title}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-xs text-gray-400">+{dayTasks.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      {selectedDay && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">
            مهام {format(selectedDay, "d MMMM", { locale: arSA })}
          </h2>
          {selectedDayTasks.length === 0 ? (
            <p className="text-center text-gray-400 py-6">لا توجد مهام في هذا اليوم</p>
          ) : (
            selectedDayTasks.map((task) => (
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
        </div>
      )}

      {/* Legend */}
      {isParent && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: memberColors[m.id] }}
              />
              {m.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
