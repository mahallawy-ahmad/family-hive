"use client";

import { useState, useEffect, useCallback } from "react";
import type { Notification } from "@/lib/types";

export function useNotifications(memberId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!memberId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/notifications?memberId=${memberId}`);
      if (res.ok) setNotifications(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (!memberId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, unreadCount, markAllAsRead, refresh: fetchNotifications };
}
