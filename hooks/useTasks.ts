"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus, TaskCategory, TaskPriority, RecurringType } from "@/lib/types";

export function useTasks(memberId?: string, allTasks = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (allTasks) params.set("all", "true");
      else if (memberId) params.set("memberId", memberId);

      const res = await fetch(`/api/tasks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [memberId, allTasks]);

  useEffect(() => {
    fetchTasks();
    // Poll every 30 seconds
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const addTask = async (data: {
    title: string;
    description?: string;
    assignedToId: string;
    createdById: string;
    category: TaskCategory;
    priority: TaskPriority;
    baseReward?: number;
    isProposed?: boolean;
    dueDate?: Date | string;
    dueTime?: string;
    isRecurring?: boolean;
    recurringType?: RecurringType;
  }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const task = await res.json();
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const approveTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/approve`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "approved" as TaskStatus } : t)));
    await fetchTasks(); // refresh to get new recurring task
    return res.json();
  };

  const rejectTask = async (taskId: string, comment?: string) => {
    const res = await fetch(`/api/tasks/${taskId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  };

  const deleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const refresh = () => fetchTasks();

  return { tasks, loading, addTask, updateTaskStatus, approveTask, rejectTask, deleteTask, refresh };
}
