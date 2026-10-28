export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
}

/** UTC calendar date, matching daily puzzle identity. */
export function utcDateString(date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function previousUtcDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().split("T")[0];
}

/**
 * Count at most one win per UTC day. A missed day starts the streak over at 1.
 * Another win on the same day leaves the streak unchanged.
 */
export function advanceStreak(stats: StreakState, today: string): StreakState {
  let currentStreak: number;
  if (stats.lastPlayedDate === today) {
    currentStreak = stats.currentStreak;
  } else if (stats.lastPlayedDate && previousUtcDate(today) === stats.lastPlayedDate) {
    currentStreak = stats.currentStreak + 1;
  } else {
    currentStreak = 1;
  }
  return {
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, currentStreak),
    lastPlayedDate: today,
  };
}
