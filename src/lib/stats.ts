import type { GameStats, Rank } from "./types";

const RANKS = new Set<Rank>([
  "Beginner",
  "Novice",
  "Skilled",
  "Expert",
  "Master",
  "Genius",
]);

export const initialStats: GameStats = {
  gamesPlayed: 0,
  gamesCompleted: 0,
  totalScore: 0,
  bestScore: 0,
  quartilesFound: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  rankHistory: [],
};

function nonNegativeInt(value: unknown, max = 1_000_000): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return Math.min(max, Math.floor(value));
}

/** Drop malformed localStorage stats instead of throwing on the next win. */
export function sanitizeStats(value: unknown): GameStats {
  if (!value || typeof value !== "object") return { ...initialStats, rankHistory: [] };
  const stats = value as Record<string, unknown>;
  const lastPlayed = stats.lastPlayedDate;
  const rankHistory = Array.isArray(stats.rankHistory)
    ? stats.rankHistory
        .filter((rank): rank is Rank => typeof rank === "string" && RANKS.has(rank as Rank))
        .slice(-100)
    : [];

  return {
    gamesPlayed: nonNegativeInt(stats.gamesPlayed),
    gamesCompleted: nonNegativeInt(stats.gamesCompleted),
    totalScore: nonNegativeInt(stats.totalScore, 10_000_000),
    bestScore: nonNegativeInt(stats.bestScore, 10_000_000),
    quartilesFound: nonNegativeInt(stats.quartilesFound),
    currentStreak: nonNegativeInt(stats.currentStreak, 10_000),
    longestStreak: nonNegativeInt(stats.longestStreak, 10_000),
    lastPlayedDate:
      typeof lastPlayed === "string" && /^\d{4}-\d{2}-\d{2}$/.test(lastPlayed) ? lastPlayed : null,
    rankHistory,
  };
}
