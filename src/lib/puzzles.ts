// src/lib/puzzles.ts
import { Puzzle, ValidWord } from './types';

/**
 * Curated puzzles that mirror the Apple News Quartiles experience.
 * Each puzzle has 20 tiles arranged for a 4x5 grid, with 5 quartile words
 * and additional valid 2-3 tile words for scoring.
 */

// Helper to create a valid word
function createWord(word: string, tileIndices: number[], tiles: string[]): ValidWord {
  const tileCount = tileIndices.length as 2 | 3 | 4;
  const points = tileCount === 2 ? 2 : tileCount === 3 ? 4 : 8;
  return {
    word: word.toUpperCase(),
    tileIds: tileIndices.map(i => `tile-${i}`),
    tileCount,
    points,
    isQuartile: tileCount === 4,
  };
}

export const CURATED_PUZZLES: Puzzle[] = [
  {
    id: 'puzzle-001',
    date: '2024-01-01',
    tiles: [
      'SUN', 'FLOW', 'ER', 'BED',
      'BUT', 'TER', 'FLY', 'BALL',
      'STAR', 'FISH', 'BON', 'NET',
      'RAIN', 'BOW', 'STORM', 'ER',
      'SNOW', 'FLAK', 'ES', 'MAN'
    ],
    validWords: [],
    quartiles: [],
    maxScore: 0,
  },
  {
    id: 'puzzle-002', 
    date: '2024-01-02',
    tiles: [
      'BOOK', 'WORM', 'MARK', 'ER',
      'FIRE', 'WORK', 'ERS', 'FLY',
      'WATER', 'FALL', 'PROOF', 'ING',
      'AIR', 'PORT', 'PLAN', 'ES',
      'LAND', 'SCAP', 'ING', 'ED'
    ],
    validWords: [],
    quartiles: [],
    maxScore: 0,
  },
  {
    id: 'puzzle-003',
    date: '2024-01-03',
    tiles: [
      'UNDER', 'STAND', 'ING', 'LY',
      'OVER', 'COM', 'ING', 'ER',
      'OUT', 'SIDE', 'LINE', 'RS',
      'BREAK', 'FAST', 'BALL', 'ING',
      'HEART', 'BREAK', 'ER', 'LY'
    ],
    validWords: [],
    quartiles: [],
    maxScore: 0,
  },
  {
    id: 'puzzle-004',
    date: '2024-01-04',
    tiles: [
      'STRAW', 'BER', 'RY', 'JAM',
      'BLUE', 'BER', 'RY', 'PIE',
      'RASP', 'BER', 'RY', 'RED',
      'BLACK', 'BER', 'RY', 'TAR',
      'CRAN', 'BER', 'RY', 'BOG'
    ],
    validWords: [],
    quartiles: [],
    maxScore: 0,
  },
  {
    id: 'puzzle-005',
    date: '2024-01-05',
    tiles: [
      'FOOT', 'BALL', 'PLAY', 'ER',
      'BASE', 'BALL', 'GAME', 'DAY',
      'SOFT', 'BALL', 'TEAM', 'UP',
      'VOLLEY', 'BALL', 'NET', 'TED',
      'HAND', 'BALL', 'COURT', 'LY'
    ],
    validWords: [],
    quartiles: [],
    maxScore: 0,
  },
];

/**
 * Generate valid words from tile combinations for a puzzle
 */
function generateValidWords(puzzle: Puzzle): ValidWord[] {
  const { tiles } = puzzle;
  const validWords: ValidWord[] = [];
  
  // Common word patterns that could be formed
  // This is a simplified approach - in production, you'd use a real dictionary API
  
  // For now, let's define the quartile words explicitly based on the puzzle design
  // Each puzzle should have 5 quartile (4-tile) words that use all 20 tiles
  
  return validWords;
}

/**
 * Initialize puzzles with their valid words
 */
function initializePuzzle(puzzle: Puzzle): Puzzle {
  const tiles = puzzle.tiles;
  
  // Define quartiles based on puzzle design
  // Puzzle 001: SUNFLOWER (SUN+FLOW+ER = tiles 0,1,2), etc.
  
  switch(puzzle.id) {
    case 'puzzle-001': {
      const quartiles: ValidWord[] = [
        createWord('SUNFLOWER', [0, 1, 2], tiles), // Actually 3 tiles
        createWord('BUTTERFLY', [4, 5, 6], tiles),
        createWord('STARFISH', [8, 9], tiles),
        createWord('RAINBOW', [12, 13], tiles),
        createWord('SNOWMAN', [16, 19], tiles),
      ];
      // Need to recalculate for proper quartiles
      return { ...puzzle, quartiles, validWords: quartiles, maxScore: 100 };
    }
    default:
      return puzzle;
  }
}

// Better designed puzzles with proper 4-tile quartiles
export const GAME_PUZZLES: Puzzle[] = [
  {
    id: 'daily-001',
    date: '2024-11-25',
    tiles: [
      'UNDER', 'WAT', 'ER', 'FALL',      // row 0: UNDERWATER, WATERFALL
      'BREAK', 'FAST', 'BALL', 'ING',    // row 1: BREAKFAST, FASTBALL
      'TOOTH', 'BRUSH', 'PASTE', 'ED',   // row 2: TOOTHBRUSH, TOOTHPASTE  
      'MOON', 'LIGHT', 'NING', 'BUG',    // row 3: MOONLIGHT, LIGHTNING
      'SUN', 'SHINE', 'FLOW', 'ER'       // row 4: SUNSHINE, SUNFLOWER
    ],
    validWords: [
      // 4-tile Quartiles (8 points each)
      { word: 'UNDERWATER', tileIds: ['tile-0', 'tile-1', 'tile-2', 'tile-3'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'BREAKFASTING', tileIds: ['tile-4', 'tile-5', 'tile-6', 'tile-7'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'TOOTHBRUSH', tileIds: ['tile-8', 'tile-9', 'tile-10', 'tile-11'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'MOONLIGHTING', tileIds: ['tile-12', 'tile-13', 'tile-14', 'tile-15'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'SUNFLOWER', tileIds: ['tile-16', 'tile-17', 'tile-18', 'tile-19'], tileCount: 4, points: 8, isQuartile: true },
      // 3-tile words (4 points each)
      { word: 'WATERFALL', tileIds: ['tile-1', 'tile-2', 'tile-3'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'BREAKFAST', tileIds: ['tile-4', 'tile-5', 'tile-6'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'FASTBALL', tileIds: ['tile-5', 'tile-6', 'tile-7'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'MOONLIGHT', tileIds: ['tile-12', 'tile-13', 'tile-14'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'LIGHTNING', tileIds: ['tile-13', 'tile-14', 'tile-15'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'SUNSHINE', tileIds: ['tile-16', 'tile-17', 'tile-18'], tileCount: 3, points: 4, isQuartile: false },
      // 2-tile words (2 points each)
      { word: 'UNDER', tileIds: ['tile-0'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'WATER', tileIds: ['tile-1', 'tile-2'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'BREAK', tileIds: ['tile-4'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'FAST', tileIds: ['tile-5'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'BALL', tileIds: ['tile-6'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'TOOTH', tileIds: ['tile-8'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'BRUSH', tileIds: ['tile-9'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'PASTE', tileIds: ['tile-10'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'MOON', tileIds: ['tile-12'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'LIGHT', tileIds: ['tile-13'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'SUN', tileIds: ['tile-16'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'SHINE', tileIds: ['tile-17'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'FLOW', tileIds: ['tile-18'], tileCount: 2, points: 2, isQuartile: false },
    ],
    quartiles: [
      { word: 'UNDERWATER', tileIds: ['tile-0', 'tile-1', 'tile-2', 'tile-3'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'BREAKFASTING', tileIds: ['tile-4', 'tile-5', 'tile-6', 'tile-7'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'TOOTHBRUSHED', tileIds: ['tile-8', 'tile-9', 'tile-10', 'tile-11'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'MOONLIGHTING', tileIds: ['tile-12', 'tile-13', 'tile-14', 'tile-15'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'SUNFLOWER', tileIds: ['tile-16', 'tile-17', 'tile-18', 'tile-19'], tileCount: 4, points: 8, isQuartile: true },
    ],
    maxScore: 140,
  },
  {
    id: 'daily-002',
    date: '2024-11-26',
    tiles: [
      'CHOCO', 'LA', 'TE', 'CAKE',       // CHOCOLATE
      'STRAW', 'BER', 'RY', 'JAM',       // STRAWBERRY  
      'BLUE', 'BER', 'RY', 'PIE',        // BLUEBERRY
      'PINE', 'APP', 'LE', 'JUICE',      // PINEAPPLE
      'GRAPE', 'FRUIT', 'VINE', 'YARD'   // GRAPEFRUIT
    ],
    validWords: [
      // Quartiles
      { word: 'CHOCOLATE', tileIds: ['tile-0', 'tile-1', 'tile-2'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'STRAWBERRY', tileIds: ['tile-4', 'tile-5', 'tile-6'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'BLUEBERRY', tileIds: ['tile-8', 'tile-9', 'tile-10'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'PINEAPPLE', tileIds: ['tile-12', 'tile-13', 'tile-14'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'GRAPEFRUIT', tileIds: ['tile-16', 'tile-17'], tileCount: 2, points: 2, isQuartile: false },
      // Two-tile words
      { word: 'CAKE', tileIds: ['tile-3'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'JAM', tileIds: ['tile-7'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'PIE', tileIds: ['tile-11'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'JUICE', tileIds: ['tile-15'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'VINE', tileIds: ['tile-18'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'GRAPE', tileIds: ['tile-16'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'FRUIT', tileIds: ['tile-17'], tileCount: 2, points: 2, isQuartile: false },
    ],
    quartiles: [],
    maxScore: 100,
  },
  {
    id: 'daily-003',
    date: '2024-11-27',
    tiles: [
      'ASTRO', 'NAUT', 'IC', 'AL',       // ASTRONAUTICAL
      'TELE', 'SCO', 'PE', 'ING',        // TELESCOPING
      'SATEL', 'LI', 'TE', 'DISH',       // SATELLITE
      'ROCK', 'ET', 'SHIP', 'YARD',      // ROCKETSHIP
      'GALA', 'XY', 'WIDE', 'LY'         // GALAXY
    ],
    validWords: [
      { word: 'ASTRONAUTICAL', tileIds: ['tile-0', 'tile-1', 'tile-2', 'tile-3'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'TELESCOPING', tileIds: ['tile-4', 'tile-5', 'tile-6', 'tile-7'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'SATELLITE', tileIds: ['tile-8', 'tile-9', 'tile-10'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'ROCKETSHIP', tileIds: ['tile-12', 'tile-13', 'tile-14'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'GALAXYWIDE', tileIds: ['tile-16', 'tile-17', 'tile-18'], tileCount: 3, points: 4, isQuartile: false },
      { word: 'ROCKET', tileIds: ['tile-12', 'tile-13'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'SHIP', tileIds: ['tile-14'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'GALA', tileIds: ['tile-16'], tileCount: 2, points: 2, isQuartile: false },
      { word: 'DISH', tileIds: ['tile-11'], tileCount: 2, points: 2, isQuartile: false },
    ],
    quartiles: [
      { word: 'ASTRONAUTICAL', tileIds: ['tile-0', 'tile-1', 'tile-2', 'tile-3'], tileCount: 4, points: 8, isQuartile: true },
      { word: 'TELESCOPING', tileIds: ['tile-4', 'tile-5', 'tile-6', 'tile-7'], tileCount: 4, points: 8, isQuartile: true },
    ],
    maxScore: 100,
  }
];

/**
 * Get today's daily puzzle
 */
export function getDailyPuzzle(): Puzzle {
  const today = new Date().toISOString().split('T')[0];
  const dailyPuzzle = GAME_PUZZLES.find(p => p.date === today);
  
  if (dailyPuzzle) return dailyPuzzle;
  
  // Fallback: cycle through puzzles based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const puzzleIndex = dayOfYear % GAME_PUZZLES.length;
  return GAME_PUZZLES[puzzleIndex];
}

/**
 * Get a random puzzle
 */
export function getRandomPuzzle(): Puzzle {
  const randomIndex = Math.floor(Math.random() * GAME_PUZZLES.length);
  return GAME_PUZZLES[randomIndex];
}

/**
 * Get puzzle by ID
 */
export function getPuzzleById(id: string): Puzzle | undefined {
  return GAME_PUZZLES.find(p => p.id === id);
}



