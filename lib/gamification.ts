import { addDays, addWeeks, addMonths, isYesterday, isToday } from "date-fns";

export const PRESTIGE_THRESHOLD = 5000;
export const STREAK_BONUS_DAYS = 5;
export const STREAK_BONUS_MULTIPLIER = 1.2;

/**
 * Calculate final points for a completed task
 * Final Points = Base_Reward × Point_Multiplier × Streak_Bonus
 */
export function calculatePoints(
  baseReward: number,
  pointMultiplier: number,
  streakBonus: number
): number {
  return Math.round(baseReward * pointMultiplier * streakBonus);
}

/**
 * Determine if streak bonus applies
 */
export function shouldTriggerStreakBonus(currentStreak: number): boolean {
  return currentStreak >= STREAK_BONUS_DAYS;
}

/**
 * Update streak based on last task date and return new streak + bonus
 */
export function updateStreak(
  currentStreak: number,
  lastTaskDate: Date | null
): { newStreak: number; streakBonus: number } {
  let newStreak = 1;

  if (lastTaskDate) {
    if (isToday(lastTaskDate)) {
      // Already did a task today — keep streak
      newStreak = currentStreak;
    } else if (isYesterday(lastTaskDate)) {
      // Consecutive day — increment
      newStreak = currentStreak + 1;
    } else {
      // Gap in streak — reset
      newStreak = 1;
    }
  }

  const streakBonus = shouldTriggerStreakBonus(newStreak) ? STREAK_BONUS_MULTIPLIER : 1.0;

  return { newStreak, streakBonus };
}

/**
 * Check if member can prestige
 */
export function canPrestige(lifetimePoints: number): boolean {
  return lifetimePoints >= PRESTIGE_THRESHOLD;
}

/**
 * Get the next recurring task date
 */
export function getNextRecurringDate(
  from: Date,
  type: "daily" | "weekly" | "monthly"
): Date {
  switch (type) {
    case "daily":
      return addDays(from, 1);
    case "weekly":
      return addWeeks(from, 1);
    case "monthly":
      return addMonths(from, 1);
  }
}

/**
 * Format points display
 */
export function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return points.toString();
}
