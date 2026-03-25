"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRewards } from "@/hooks/useRewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Store, Plus, Trash2, ShoppingCart, Edit } from "lucide-react";
import { toast } from "sonner";
import type { Reward } from "@/lib/types";
import { useMembers } from "@/hooks/useMembers";

export default function StorePage() {
  const { activeMember, refreshMember } = useAuth();
  const { rewards, loading, addReward, updateReward, deleteReward, purchaseReward } = useRewards();
  const { members } = useMembers();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const isAdmin = activeMember?.role === "admin" || activeMember?.role === "parent";

  // Form state
  const [form, setForm] = useState({ title: "", description: "", costInCredits: "", icon: "🎁" });

  if (!activeMember) return null;

  const handleAdd = async () => {
    if (!form.title || !form.costInCredits || !form.icon) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    try {
      await addReward({
        title: form.title,
        description: form.description || undefined,
        costInCredits: parseInt(form.costInCredits),
        icon: form.icon,
      });
      toast.success("✅ تمت إضافة المكافأة");
      setAddDialogOpen(false);
      setForm({ title: "", description: "", costInCredits: "", icon: "🎁" });
    } catch {
      toast.error("فشلت الإضافة");
    }
  };

  const handleEdit = async () => {
    if (!editingReward) return;
    try {
      await updateReward(editingReward.id, {
        title: editingReward.title,
        description: editingReward.description,
        costInCredits: editingReward.costInCredits,
        icon: editingReward.icon,
      });
      toast.success("✅ تم التحديث");
      setEditDialogOpen(false);
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذه المكافأة؟")) return;
    try {
      await deleteReward(id);
      toast.success("تم الحذف");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const handlePurchase = async (reward: Reward) => {
    if (!activeMember) return;
    if (activeMember.walletBalance < reward.costInCredits) {
      toast.error("رصيدك غير كافٍ!");
      return;
    }
    setPurchasing(reward.id);
    try {
      const result = await purchaseReward(reward.id, activeMember.id);
      toast.success(`🎉 تم شراء ${reward.title} ${reward.icon}! رصيدك الآن: ${result.newBalance}`);
      await refreshMember();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الشراء");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Store className="w-7 h-7 text-amber-500" />
            متجر المكافآت
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            رصيدك: <span className="font-bold text-amber-600">{activeMember.walletBalance}</span> نقطة
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 gap-1"
          >
            <Plus className="w-4 h-4" />
            إضافة مكافأة
          </Button>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-gray-500 font-medium">المتجر فارغ حاليًا</p>
          {isAdmin && (
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="mt-4"
            >
              إضافة أول مكافأة
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => {
            const canAfford = activeMember.walletBalance >= reward.costInCredits;

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-2xl shadow-sm p-5 border transition-all ${
                  !reward.isAvailable ? "opacity-50" : ""
                } ${canAfford && !isAdmin ? "border-amber-200" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{reward.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{reward.title}</h3>
                      {reward.description && (
                        <p className="text-gray-500 text-sm">{reward.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-sm">
                    💰 {reward.costInCredits}
                  </Badge>
                </div>

                <div className="mt-4 flex gap-2">
                  {isAdmin ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                        onClick={() => { setEditingReward({ ...reward }); setEditDialogOpen(true); }}
                      >
                        <Edit className="w-3 h-3" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-1"
                        onClick={() => handleDelete(reward.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(reward)}
                      disabled={!canAfford || !reward.isAvailable || purchasing === reward.id}
                      className={`flex-1 gap-2 ${
                        canAfford && reward.isAvailable
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "opacity-50"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {purchasing === reward.id
                        ? "جاري..."
                        : canAfford
                        ? `اشتري بـ ${reward.costInCredits}`
                        : `تحتاج ${reward.costInCredits - activeMember.walletBalance} نقطة إضافية`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مكافأة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {["🍬", "🕐", "⏭️", "🎮", "✈️", "🍕", "💰", "🎁", "🏆", "🎯", "📱", "🎬"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                  className={`text-2xl p-2 rounded-lg border ${
                    form.icon === emoji ? "border-amber-500 bg-amber-50" : "border-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label>الاسم</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="مثلاً: وقت شاشة إضافي"
              />
            </div>
            <div className="space-y-1">
              <Label>الوصف (اختياري)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="تفاصيل المكافأة..."
              />
            </div>
            <div className="space-y-1">
              <Label>التكلفة (نقاط)</Label>
              <Input
                type="number"
                value={form.costInCredits}
                onChange={(e) => setForm((f) => ({ ...f, costInCredits: e.target.value }))}
                placeholder="مثلاً: 50"
                min={1}
              />
            </div>
            <Button onClick={handleAdd} className="w-full bg-amber-500 hover:bg-amber-600">
              إضافة المكافأة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingReward && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل المكافأة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={editingReward.title}
                  onChange={(e) => setEditingReward((r) => r ? { ...r, title: e.target.value } : r)}
                />
              </div>
              <div className="space-y-1">
                <Label>الأيقونة</Label>
                <Input
                  value={editingReward.icon}
                  onChange={(e) => setEditingReward((r) => r ? { ...r, icon: e.target.value } : r)}
                />
              </div>
              <div className="space-y-1">
                <Label>التكلفة</Label>
                <Input
                  type="number"
                  value={editingReward.costInCredits}
                  onChange={(e) => setEditingReward((r) => r ? { ...r, costInCredits: parseInt(e.target.value) } : r)}
                />
              </div>
              <Button onClick={handleEdit} className="w-full">حفظ التغييرات</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
