"use client";

import { useState, useEffect, useCallback } from "react";
import type { Reward } from "@/lib/types";

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) setRewards(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const addReward = async (data: {
    title: string;
    description?: string;
    costInCredits: number;
    icon: string;
  }) => {
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const reward = await res.json();
    setRewards((prev) => [...prev, reward]);
    return reward;
  };

  const updateReward = async (id: string, data: Partial<Reward>) => {
    const res = await fetch(`/api/rewards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const updated = await res.json();
    setRewards((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteReward = async (id: string) => {
    const res = await fetch(`/api/rewards/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  const purchaseReward = async (rewardId: string, memberId: string) => {
    const res = await fetch(`/api/rewards/${rewardId}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "فشل الشراء");
    }
    return res.json();
  };

  return { rewards, loading, addReward, updateReward, deleteReward, purchaseReward, refresh: fetchRewards };
}
