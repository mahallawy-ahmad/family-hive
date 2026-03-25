"use client";

import { useState, useEffect, useCallback } from "react";
import type { Announcement } from "@/lib/types";

export function useAnnouncements(memberId?: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const params = memberId ? `?memberId=${memberId}` : "";
      const res = await fetch(`/api/announcements${params}`);
      if (res.ok) setAnnouncements(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const addAnnouncement = async (title: string, content: string, createdById: string) => {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, createdById }),
    });
    if (!res.ok) throw new Error(await res.text());
    const ann = await res.json();
    setAnnouncements((prev) => [ann, ...prev]);
    return ann;
  };

  const markRead = async (announcementId: string, memberId: string) => {
    await fetch(`/api/announcements/${announcementId}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId ? { ...a, isRead: true } : a))
    );
  };

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return { announcements, loading, addAnnouncement, markRead, unreadCount };
}
