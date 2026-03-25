"use client";

import type { Member } from "@/lib/types";
import { getInitials } from "@/lib/utils";

interface MemberAvatarProps {
  member: Member;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8 text-sm" },
  md: { container: "w-10 h-10 text-base" },
  lg: { container: "w-14 h-14 text-xl" },
  xl: { container: "w-20 h-20 text-3xl" },
};

export function MemberAvatar({ member, size = "md", className = "" }: MemberAvatarProps) {
  const { container } = sizeMap[size];
  const avatarValue = member.avatar || member.color || "#6366f1";
  const isHex = avatarValue.startsWith("#");

  return (
    <div
      className={`${container} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={isHex ? { backgroundColor: avatarValue, color: "#fff" } : {}}
    >
      {isHex ? getInitials(member.name) : avatarValue}
    </div>
  );
}
