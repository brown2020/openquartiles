// src/stores/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Tile, 
  FoundWord, 
  Puzzle, 
  GameStats, 
  calculateRank, 
  SCORING,
  Rank,
  ValidWord
} from '@/lib/types';

interface GameStore {
  // Game state
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
  showHowToPlay: boolean;
  showWordBreakdown: boolean;
  lastAttemptedWord: string | null;
  lastAttemptResult: 'correct' | 'incorrect' | 'already-found' | null;
  inputTheme: string;
  
  // Stats (persisted)
  stats: GameStats;
  
  // Actions
  initializePuzzle: (puzzle: Puzzle) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInputTheme: (theme: string) => void;
  selectTile: (tileId: string) => void;
  deselectTile: (tileId: string) => void;
  clearSelection: () => void;
  submitWord: () => void;
  shuffleTiles: () => void;
  useHint: () => string | null;
  resetGame: () => void;
  setShowHowToPlay: (show: boolean) => void;
  setShowWordBreakdown: (show: boolean) => void;
  getCurrentWord: () => string;
  getRank: () => Rank;
  getUnfoundQuartiles: () => ValidWord[];
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

function createTilesFromPuzzle(puzzle: Puzzle): Tile[] {
  return puzzle.tiles.map((text, index) => ({
    id: `tile-${index}`,
    text,
    isUsed: false,
    isSelected: false,
    position: index,
  }));
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
      showWordBreakdown: false,
      lastAttemptedWord: null,
      lastAttemptResult: null,
      inputTheme: '',
      stats: initialStats,

      initializePuzzle: (puzzle: Puzzle) => {
        const tiles = createTilesFromPuzzle(puzzle);
        
        set({
          puzzle,
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

      getCurrentWord: () => {
        const { tiles, selectedTileIds } = get();
        return selectedTileIds
          .map(id => tiles.find(t => t.id === id)?.text || '')
          .join('');
      },

      getUnfoundQuartiles: () => {
        const { puzzle, foundWords } = get();
        if (!puzzle) return [];
        
        return puzzle.quartiles.filter(
          q => !foundWords.some(fw => fw.word === q.word)
        );
      },

      submitWord: () => {
        const { puzzle, tiles, selectedTileIds, foundWords, score, quartilesFound, stats } = get();
        
        if (!puzzle || selectedTileIds.length < 2) return;

        const currentWord = get().getCurrentWord();
        
        // Check if already found
        const alreadyFound = foundWords.some(fw => fw.word === currentWord);
        if (alreadyFound) {
          set({
            lastAttemptedWord: currentWord,
            lastAttemptResult: 'already-found',
          });
          get().clearSelection();
          return;
        }

        // Check if valid word - match by word text only
        const validWord = puzzle.validWords.find(vw => vw.word === currentWord);
        
        // Calculate tile count and points dynamically
        const tileCount = selectedTileIds.length;
        const points = tileCount >= 4 ? SCORING.FOUR_TILES : 
                      tileCount === 3 ? SCORING.THREE_TILES : 
                      SCORING.TWO_TILES;
        const isQuartile = tileCount >= 4;

        if (validWord) {
          const newFoundWord: FoundWord = {
            word: currentWord,
            tileIds: [...selectedTileIds],
            tileCount,
            points,
            isQuartile,
            foundAt: Date.now(),
          };
          
          const newFoundWords = [...foundWords, newFoundWord];
          const newScore = score + points;
          const newQuartilesFound = quartilesFound + (isQuartile ? 1 : 0);
          
          // Check for all quartiles bonus
          let bonusScore = 0;
          if (newQuartilesFound === 5 && quartilesFound < 5) {
            bonusScore = SCORING.ALL_QUARTILES_BONUS;
          }
          
          const finalScore = newScore + bonusScore;
          
          // Only mark tiles as used for quartiles (4-tile words)
          // Shorter words score points but don't remove tiles
          const newTiles = isQuartile 
            ? tiles.map(t => 
                selectedTileIds.includes(t.id) 
                  ? { ...t, isUsed: true, isSelected: false }
                  : t
              )
            : tiles.map(t => ({ ...t, isSelected: false }));
          
          // Check if game is complete (all quartiles found)
          const isComplete = newQuartilesFound === 5;
          
          // Update stats if complete
          let newStats = stats;
          if (isComplete) {
            newStats = {
              ...stats,
              gamesPlayed: stats.gamesPlayed + 1,
              gamesCompleted: stats.gamesCompleted + 1,
              totalScore: stats.totalScore + finalScore,
              bestScore: Math.max(stats.bestScore, finalScore),
              quartilesFound: stats.quartilesFound + newQuartilesFound,
              currentStreak: stats.currentStreak + 1,
              longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1),
              lastPlayedDate: new Date().toISOString().split('T')[0],
              rankHistory: [...stats.rankHistory, calculateRank(finalScore, newQuartilesFound)],
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
          });
        } else {
          set({
            lastAttemptedWord: currentWord,
            lastAttemptResult: 'incorrect',
          });
          get().clearSelection();
        }
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

      useHint: () => {
        const { hintsUsed } = get();
        const unfound = get().getUnfoundQuartiles();
        
        if (unfound.length === 0) return null;
        
        // Get a random unfound quartile
        const hintWord = unfound[Math.floor(Math.random() * unfound.length)];
        
        set({ hintsUsed: hintsUsed + 1 });
        
        // Return first few letters as hint
        return hintWord.word.substring(0, 4) + '...';
      },

      resetGame: () => {
        set({
          puzzle: null,
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

      setShowWordBreakdown: (show: boolean) => {
        set({ showWordBreakdown: show });
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
