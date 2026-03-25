export type Role = "admin" | "parent" | "child";
export type TaskStatus = "todo" | "in_progress" | "done" | "approved" | "rejected";
export type TaskCategory = "school" | "home" | "health" | "personal" | "shopping" | "other";
export type TaskPriority = "low" | "medium" | "high";
export type RecurringType = "daily" | "weekly" | "monthly";
export type TransactionType = "earned" | "spent" | "prestige_reset";

export interface Member {
  id: string;
  userId: string;
  name: string;
  role: Role;
  color: string;
  avatar?: string;
  walletBalance: number;
  lifetimePoints: number;
  currentStreak: number;
  prestigeLevel: number;
  pointMultiplier: number;
  lastTaskDate?: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedToId: string;
  assignedTo?: Member;
  createdById: string;
  createdBy?: Member;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  baseReward: number;
  isProposed: boolean;
  adminComment?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  isRecurring: boolean;
  recurringType?: RecurringType | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  costInCredits: number;
  icon: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  type: TransactionType;
  amount: number;
  description: string;
  taskId?: string;
  rewardId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  memberId: string;
  message: string;
  isRead: boolean;
  taskId?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdById: string;
  createdBy?: Member;
  isRead?: boolean;
  createdAt: string;
}

// Category labels
export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  school: "مدرسة",
  home: "منزل",
  health: "صحة",
  personal: "شخصي",
  shopping: "تسوق",
  other: "أخرى",
};

// Category colors
export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  school: "bg-blue-100 text-blue-800",
  home: "bg-green-100 text-green-800",
  health: "bg-red-100 text-red-800",
  personal: "bg-purple-100 text-purple-800",
  shopping: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
};

// Priority labels
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "خفيفة",
  medium: "متوسطة",
  high: "شاقة",
};

// Priority reward points
export const PRIORITY_REWARDS: Record<TaskPriority, number> = {
  low: 10,
  medium: 30,
  high: 50,
};

// Status labels
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "لم يبدأ",
  in_progress: "جاري",
  done: "منتهي",
  approved: "معتمد",
  rejected: "مرفوض",
};

// Status colors
export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-orange-100 text-orange-600",
  high: "bg-red-100 text-red-600",
};

export const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9",
];
