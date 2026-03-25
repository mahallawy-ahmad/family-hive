"use client";

import { useState } from "react";
import { Trash2, Clock, RotateCcw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task, Member, TaskStatus } from "@/lib/types";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  member?: Member;
  canDelete: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

const STATUS_FLOW: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: "in_progress",
  in_progress: "done",
};

export function TaskCard({ task, member, canDelete, onStatusChange, onDelete }: TaskCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    task.status !== "approved" &&
    new Date(task.dueDate) < new Date();

  const nextStatus = STATUS_FLOW[task.status];

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const handleStatusChange = async (s: TaskStatus) => {
    setUpdating(true);
    await onStatusChange(s);
    setUpdating(false);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-4 space-y-3 shadow-sm transition-all",
        isOverdue && "border-red-200 bg-red-50/30",
        (task.status === "done" || task.status === "approved") && "opacity-70",
        task.adminComment && "border-red-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-gray-800",
            (task.status === "approved") && "line-through text-gray-400"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          {task.adminComment && (
            <p className="text-xs text-red-500 mt-1 bg-red-50 p-1.5 rounded">
              💬 {task.adminComment}
            </p>
          )}
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[task.category])}>
          {CATEGORY_LABELS[task.category]}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
          💰 {task.baseReward}
        </span>
        {task.isRecurring && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            متكررة
          </span>
        )}
      </div>

      {/* Due date */}
      {task.dueDate && (
        <div className={cn("flex items-center gap-1.5 text-xs", isOverdue ? "text-red-500" : "text-gray-400")}>
          {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {isOverdue ? "متأخرة! " : ""}
          {format(new Date(task.dueDate), "d MMMM yyyy", { locale: ar })}
          {task.dueTime && ` - ${task.dueTime}`}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {member && (
          <div className="flex items-center gap-2">
            <MemberAvatar member={member} size="sm" />
            <span className="text-xs text-gray-500">{member.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mr-auto">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[task.status])}>
            {STATUS_LABELS[task.status]}
          </span>
          {nextStatus && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => handleStatusChange(nextStatus)}
              disabled={updating}
            >
              {updating ? "..." : nextStatus === "in_progress" ? "▶ ابدأ" : "✓ أنهِ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
