// src/stores/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gradeWord, revealHint } from '@/lib/actions';
import { 
  Tile, 
  FoundWord, 
  ClientPuzzle, 
  GameStats, 
  calculateRank, 
  SCORING,
  Rank,
} from '@/lib/types';

interface GameStore {
  // Game state
  puzzle: ClientPuzzle | null;
  isGrading: boolean;
  tiles: Tile[];
  selectedTileIds: string[];
  foundWords: FoundWord[];
  score: number;
  quartilesFound: number;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  hintsUsed: number;
  showHowToPlay: boolean;
  lastAttemptedWord: string | null;
  lastAttemptResult: 'correct' | 'incorrect' | 'already-found' | null;
  inputTheme: string;
  
  // Stats (persisted)
  stats: GameStats;
  
  // Actions
  initializePuzzle: (puzzle: ClientPuzzle) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInputTheme: (theme: string) => void;
  selectTile: (tileId: string) => void;
  deselectTile: (tileId: string) => void;
  clearSelection: () => void;
  reorderSelectedTiles: (newOrder: string[]) => void;
  submitWord: () => Promise<void>;
  shuffleTiles: () => void;
  getHint: () => Promise<string | null>;
  resetGame: () => void;
  setShowHowToPlay: (show: boolean) => void;
  getCurrentWord: () => string;
  getRank: () => Rank;
}

const initialStats: GameStats = {
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

function createTilesFromPuzzle(puzzle: ClientPuzzle): Tile[] {
  return puzzle.tiles.map((text, index) => ({
    id: `tile-${index}`,
    text,
    isUsed: false,
    isSelected: false,
    position: index,
  }));
}

function clearedTiles(tiles: Tile[]) {
  return {
    selectedTileIds: [] as string[],
    tiles: tiles.map((tile) => ({ ...tile, isSelected: false })),
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      puzzle: null,
      isGrading: false,
      tiles: [],
      selectedTileIds: [],
      foundWords: [],
      score: 0,
      quartilesFound: 0,
      isComplete: false,
      isLoading: false,
      error: null,
      hintsUsed: 0,
      showHowToPlay: false,
      lastAttemptedWord: null,
      lastAttemptResult: null,
      inputTheme: '',
      stats: initialStats,

      initializePuzzle: (puzzle: ClientPuzzle) => {
        const tiles = createTilesFromPuzzle(puzzle);
        
        set({
          puzzle,
          isGrading: false,
          tiles: shuffleArray(tiles),
          selectedTileIds: [],
          foundWords: [],
          score: 0,
          quartilesFound: 0,
          isComplete: false,
          isLoading: false,
          error: null,
          hintsUsed: 0,
          lastAttemptedWord: null,
          lastAttemptResult: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      setInputTheme: (theme: string) => {
        set({ inputTheme: theme });
      },

      selectTile: (tileId: string) => {
        const { tiles, selectedTileIds } = get();
        const tile = tiles.find(t => t.id === tileId);
        
        if (!tile || tile.isUsed) return;
        if (selectedTileIds.length >= 4) return;
        if (selectedTileIds.includes(tileId)) return;

        set({
          selectedTileIds: [...selectedTileIds, tileId],
          tiles: tiles.map(t => 
            t.id === tileId ? { ...t, isSelected: true } : t
          ),
          lastAttemptedWord: null,
          lastAttemptResult: null,
        });
      },

      deselectTile: (tileId: string) => {
        const { tiles, selectedTileIds } = get();
        
        // Only allow deselecting the last selected tile (for proper ordering)
        const lastSelectedId = selectedTileIds[selectedTileIds.length - 1];
        if (tileId !== lastSelectedId) return;

        set({
          selectedTileIds: selectedTileIds.filter(id => id !== tileId),
          tiles: tiles.map(t => 
            t.id === tileId ? { ...t, isSelected: false } : t
          ),
        });
      },

      clearSelection: () => {
        const { tiles } = get();
        set({
          selectedTileIds: [],
          tiles: tiles.map(t => ({ ...t, isSelected: false })),
          lastAttemptedWord: null,
          lastAttemptResult: null,
        });
      },

      reorderSelectedTiles: (newOrder: string[]) => {
        set({
          selectedTileIds: newOrder,
          lastAttemptedWord: null,
          lastAttemptResult: null,
        });
      },

      getCurrentWord: () => {
        const { tiles, selectedTileIds } = get();
        return selectedTileIds
          .map(id => tiles.find(t => t.id === id)?.text || '')
          .join('');
      },

      submitWord: async () => {
        const { puzzle, tiles, selectedTileIds, foundWords, isGrading } = get();

        if (!puzzle || selectedTileIds.length < 1 || isGrading) return;

        const currentWord = get().getCurrentWord();
        
        // Check if already found
        const alreadyFound = foundWords.some(fw => fw.word === currentWord);
        if (alreadyFound) {
          set({
            ...clearedTiles(tiles),
            lastAttemptedWord: currentWord,
            lastAttemptResult: 'already-found',
          });
          return;
        }

        const token = puzzle.answerToken;
        const selectedIds = [...selectedTileIds];
        set({ isGrading: true, error: null });

        let grade;
        try {
          grade = await gradeWord(token, currentWord);
        } catch {
          set({ isGrading: false, error: 'Could not check that word. Try again.' });
          return;
        }

        const latest = get();
        if (!latest.puzzle || latest.puzzle.answerToken !== token) {
          set({ isGrading: false });
          return;
        }

        if (grade.status === 'limited') {
          set({
            isGrading: false,
            error: 'Too many checks. Please wait a moment and try again.',
          });
          return;
        }

        if (grade.status !== 'correct') {
          set({
            ...clearedTiles(latest.tiles),
            lastAttemptedWord: currentWord,
            lastAttemptResult: 'incorrect',
            isGrading: false,
            error: null,
          });
          return;
        }

        const { points, isQuartile, tileCount } = grade;
        const newFoundWord: FoundWord = {
          word: currentWord,
          tileIds: selectedIds,
          tileCount,
          points,
          isQuartile,
          foundAt: Date.now(),
        };

        const newFoundWords = [...latest.foundWords, newFoundWord];
        const newScore = latest.score + points;
        const newQuartilesFound = latest.quartilesFound + (isQuartile ? 1 : 0);

        let bonusScore = 0;
        if (newQuartilesFound === 5 && latest.quartilesFound < 5) {
          bonusScore = SCORING.ALL_QUARTILES_BONUS;
        }

        const finalScore = newScore + bonusScore;
        const selectedSet = new Set(selectedIds);
        const newTiles = isQuartile
          ? latest.tiles.map((t) =>
              selectedSet.has(t.id)
                ? { ...t, isUsed: true, isSelected: false }
                : t
            )
          : latest.tiles.map((t) => ({ ...t, isSelected: false }));

        const isComplete = newQuartilesFound === 5;
        let newStats = latest.stats;
        if (isComplete) {
          newStats = {
            ...latest.stats,
            gamesPlayed: latest.stats.gamesPlayed + 1,
            gamesCompleted: latest.stats.gamesCompleted + 1,
            totalScore: latest.stats.totalScore + finalScore,
            bestScore: Math.max(latest.stats.bestScore, finalScore),
            quartilesFound: latest.stats.quartilesFound + newQuartilesFound,
            currentStreak: latest.stats.currentStreak + 1,
            longestStreak: Math.max(latest.stats.longestStreak, latest.stats.currentStreak + 1),
            lastPlayedDate: new Date().toISOString().split('T')[0],
            rankHistory: [...latest.stats.rankHistory, calculateRank(finalScore, newQuartilesFound)],
          };
        }

        set({
          tiles: newTiles,
          selectedTileIds: [],
          foundWords: newFoundWords,
          score: finalScore,
          quartilesFound: newQuartilesFound,
          isComplete,
          lastAttemptedWord: currentWord,
          lastAttemptResult: 'correct',
          stats: newStats,
          isGrading: false,
          error: null,
        });
      },

      shuffleTiles: () => {
        const { tiles } = get();
        const availableTiles = tiles.filter(t => !t.isUsed);
        const usedTiles = tiles.filter(t => t.isUsed);
        
        const shuffledAvailable = shuffleArray(availableTiles);
        
        // Reassign positions to shuffled tiles
        const repositionedTiles = shuffledAvailable.map((tile, index) => ({
          ...tile,
          position: index,
          isSelected: false,
        }));
        
        // Keep used tiles at the end with their original positions adjusted
        const repositionedUsed = usedTiles.map((tile, index) => ({
          ...tile,
          position: repositionedTiles.length + index,
        }));

        set({
          tiles: [...repositionedTiles, ...repositionedUsed],
          selectedTileIds: [],
        });
      },

      getHint: async () => {
        const { puzzle, foundWords, hintsUsed } = get();
        if (!puzzle) return null;
        const found = foundWords.filter((word) => word.isQuartile).map((word) => word.word);
        try {
          const result = await revealHint(puzzle.answerToken, found);
          if (result.limited) {
            set({ error: 'Too many hints. Please wait a moment and try again.' });
            return null;
          }
          if (!result.hint) return null;
          set({ hintsUsed: hintsUsed + 1, error: null });
          return result.hint;
        } catch {
          set({ error: 'Could not load a hint. Try again.' });
          return null;
        }
      },

      resetGame: () => {
        set({
          puzzle: null,
          isGrading: false,
          tiles: [],
          selectedTileIds: [],
          foundWords: [],
          score: 0,
          quartilesFound: 0,
          isComplete: false,
          isLoading: false,
          error: null,
          hintsUsed: 0,
          lastAttemptedWord: null,
          lastAttemptResult: null,
          inputTheme: '',
        });
      },

      setShowHowToPlay: (show: boolean) => {
        set({ showHowToPlay: show });
      },

      getRank: () => {
        const { score, quartilesFound } = get();
        return calculateRank(score, quartilesFound);
      },
    }),
    {
      name: 'quartiles-storage',
      partialize: (state) => ({ stats: state.stats }),
    }
  )
);
