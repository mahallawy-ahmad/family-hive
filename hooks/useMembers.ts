"use client";

import { useState, useEffect, useCallback } from "react";
import type { Member, Role } from "@/lib/types";
import { AVATAR_COLORS } from "@/lib/types";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (data: {
    name: string;
    role: Role;
    pin: string;
    avatar?: string;
    color?: string;
  }) => {
    const color = data.color || AVATAR_COLORS[members.length % AVATAR_COLORS.length];
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, color }),
    });
    if (!res.ok) throw new Error(await res.text());
    const member = await res.json();
    setMembers((prev) => [...prev, member]);
    return member;
  };

  const updateMember = async (
    id: string,
    data: Partial<{ name: string; color: string; avatar: string }>
  ) => {
    const res = await fetch(`/api/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const deleteMember = async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const changePin = async (id: string, pin: string) => {
    const res = await fetch(`/api/members/${id}/pin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  const verifyPin = async (id: string, pin: string): Promise<Member | null> => {
    const res = await fetch(`/api/members/${id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.member;
  };

  const triggerPrestige = async (id: string) => {
    const res = await fetch(`/api/members/${id}/prestige`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "فشل الارتقاء");
    }
    const updated = await res.json();
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const refresh = () => fetchMembers();

  return { members, loading, addMember, updateMember, deleteMember, changePin, verifyPin, triggerPrestige, refresh };
}
