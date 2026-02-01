// src/lib/types.ts

// Legacy types for AI-generated puzzles (backwards compatibility)
export interface WordData {
  word: string;
  chunks: string[];
}

export interface GameWords {
  theme: string;
  words: WordData[];
}

export interface GameChunk {
  id: number;
  text: string;
  isFound?: boolean;
  foundIndex?: number;
}

/**
 * Represents a single tile in the 4x5 grid
 */
export interface Tile {
  id: string;
  text: string;
  isUsed: boolean;
  isSelected: boolean;
  position: number; // 0-19 for the 4x5 grid
}

/**
 * A valid word that can be formed from tiles
 */
export interface ValidWord {
  word: string;
  tileIds: string[];
  tileCount: number;
  points: number;
  isQuartile: boolean;
}

/**
 * A found word during gameplay
 */
export interface FoundWord {
  word: string;
  tileIds: string[];
  tileCount: number;
  points: number;
  isQuartile: boolean;
  foundAt: number; // timestamp
}

/**
 * The puzzle data structure
 */
export interface Puzzle {
  id: string;
  date: string; // YYYY-MM-DD format for daily puzzles
  tiles: string[]; // 20 tile texts
  validWords: ValidWord[];
  quartiles: ValidWord[]; // The 5 main quartile words
  maxScore: number;
  theme?: string; // Optional theme for the puzzle
}

/**
 * Game statistics for persistence
 */
export interface GameStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalScore: number;
  bestScore: number;
  quartilesFound: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  rankHistory: Rank[];
}

/**
 * Player rank based on score
 */
export type Rank = 
  | 'Beginner'     // 0-24
  | 'Novice'       // 25-49
  | 'Skilled'      // 50-74
  | 'Expert'       // 75-99
  | 'Master'       // 100+
  | 'Genius';      // All quartiles + high score

/**
 * Game state for the current session
 */
export interface GameState {
  puzzle: Puzzle | null;
  tiles: Tile[];
  selectedTileIds: string[];
  foundWords: FoundWord[];
  score: number;
  quartilesFound: number;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  hintsUsed: number;
  hintsRemaining: number;
}

/**
 * Scoring constants
 */
export const SCORING = {
  ONE_TILE: 1,
  TWO_TILES: 2,
  THREE_TILES: 4,
  FOUR_TILES: 8, // Quartile!
  ALL_QUARTILES_BONUS: 40,
  EXPERT_THRESHOLD: 100,
} as const;

/**
 * Get points for a word based on tile count
 */
export function getPointsForTileCount(tileCount: 1 | 2 | 3 | 4): number {
  switch (tileCount) {
    case 1: return SCORING.ONE_TILE;
    case 2: return SCORING.TWO_TILES;
    case 3: return SCORING.THREE_TILES;
    case 4: return SCORING.FOUR_TILES;
  }
}

/**
 * Calculate rank based on score and quartiles found
 */
export function calculateRank(score: number, quartilesFound: number): Rank {
  if (quartilesFound === 5 && score >= 100) return 'Genius';
  if (score >= 100) return 'Master';
  if (score >= 75) return 'Expert';
  if (score >= 50) return 'Skilled';
  if (score >= 25) return 'Novice';
  return 'Beginner';
}

/**
 * Get rank progress (0-100) within current rank
 */
export function getRankProgress(score: number): number {
  if (score >= 100) return 100;
  const thresholds = [0, 25, 50, 75, 100];
  const currentThreshold = thresholds.filter(t => t <= score).pop() || 0;
  const nextThreshold = thresholds.find(t => t > score) || 100;
  const progress = ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}
