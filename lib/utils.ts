import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecurringType } from "./types";
import { addDays, addWeeks, addMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

export function getNextRecurringDate(date: Date, type: RecurringType): Date {
  switch (type) {
    case "daily": return addDays(date, 1);
    case "weekly": return addWeeks(date, 1);
    case "monthly": return addMonths(date, 1);
  }
}

export function getInitials(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date, time?: string): string {
  const dateStr = formatDate(date);
  return time ? `${dateStr} - ${time}` : dateStr;
}

export function isOverdue(dueDate: Date, status: string): boolean {
  return status !== "done" && dueDate < new Date();
}
