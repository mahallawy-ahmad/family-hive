"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Megaphone,
  Settings,
  LogOut,
  Plus,
  CheckCircle,
  Store,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MemberAvatar } from "@/components/family/MemberAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/my-tasks", label: "مهامي", icon: CheckSquare },
  { href: "/store", label: "المتجر", icon: Store },
  { href: "/calendar", label: "التقويم", icon: Calendar },
  { href: "/announcements", label: "إعلانات", icon: Megaphone },
];

const parentItems = [
  { href: "/family", label: "العائلة", icon: Users },
];

const adminItems = [
  { href: "/approvals", label: "الاعتمادات", icon: CheckCircle },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function Navbar() {
  const { activeMember, setActiveMember } = useAuth();
  const pathname = usePathname();

  if (!activeMember) return null;

  const isParent = activeMember.role === "admin" || activeMember.role === "parent";
  const isAdmin = activeMember.role === "admin";

  const allItems = [
    ...navItems,
    ...(isParent ? parentItems : []),
    ...(isAdmin ? adminItems : []),
  ];

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3" dir="rtl">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xl">🐝</span>
          <span className="font-bold text-amber-600 hidden sm:inline">خلية النحل</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/add-task">
            <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">مهمة</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {activeMember && <MemberAvatar member={activeMember} size="sm" />}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-gray-700 leading-tight">{activeMember?.name}</span>
              {activeMember && activeMember.walletBalance !== undefined && (
                <span className="text-xs text-amber-600 font-medium">💰 {activeMember.walletBalance} نقطة</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveMember(null)}
            title="تغيير الملف الشخصي"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden" dir="rtl">
        {allItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
              pathname.startsWith(href)
                ? "text-amber-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex fixed right-0 top-14 bottom-0 w-56 bg-white border-l border-gray-200 flex-col p-3 gap-1 z-40" dir="rtl">
        {allItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-amber-50 text-amber-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <button
            onClick={() => setActiveMember(null)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            تغيير الملف الشخصي
          </button>
        </div>
      </aside>
    </>
  );
}
