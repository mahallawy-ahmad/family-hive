"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function NotificationBell() {
  const { activeMember } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications(activeMember?.id);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    if (unreadCount > 0) markAllAsRead();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>الإشعارات</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 py-8">لا توجد إشعارات</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg transition-colors ${
                    n.isRead ? "bg-gray-50" : "bg-amber-50 border border-amber-100"
                  }`}
                >
                  <p className={`text-sm ${n.isRead ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { locale: ar, addSuffix: true })}
                  </p>
                  {!n.isRead && (
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
