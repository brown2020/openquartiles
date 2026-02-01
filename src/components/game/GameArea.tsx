// src/components/game/GameArea.tsx
'use client';

import { useEffect, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RefreshCcw, Loader2, Calendar, Shuffle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { generatePuzzle, generateDailyPuzzle } from '@/lib/actions';
import { GameBoard } from './GameBoard';
import { WordBuilder } from './WordBuilder';
import { ActionButtons } from './ActionButtons';
import { ScoreDisplay } from './ScoreDisplay';
import { FoundWordsList } from './FoundWordsList';
import { HowToPlayModal } from './HowToPlayModal';
import { GameComplete } from './GameComplete';
import { cn } from '@/lib/utils';

export default function GameArea() {
  const {
    puzzle,
    isLoading,
    error,
    inputTheme,
    setInputTheme,
    initializePuzzle,
    setLoading,
    setError,
    setShowHowToPlay,
    submitWord,
    clearSelection,
    shuffleTiles,
    selectedTileIds,
    deselectTile,
    resetGame,
  } = useGameStore();

  const [isPending, startTransition] = useTransition();

  // Generate a new puzzle
  const handleGeneratePuzzle = useCallback(async (theme?: string) => {
    setLoading(true);
    setError(null);

    try {
      const newPuzzle = await generatePuzzle(theme || undefined);
      initializePuzzle(newPuzzle);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate puzzle';
      setError(message);
    }
  }, [initializePuzzle, setLoading, setError]);

  // Generate daily puzzle
  const handleDailyPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newPuzzle = await generateDailyPuzzle();
      initializePuzzle(newPuzzle);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate daily puzzle';
      setError(message);
    }
  }, [initializePuzzle, setLoading, setError]);

  // Handle form submission
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      handleGeneratePuzzle(inputTheme || undefined);
    });
  };

  // Handle daily puzzle
  const handleStartDaily = () => {
    startTransition(() => {
      handleDailyPuzzle();
    });
  };

  // Handle new game with same theme
  const handleNewGame = () => {
    startTransition(() => {
      handleGeneratePuzzle(puzzle?.theme);
    });
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.target?.toString().includes('Input')) {
      e.preventDefault();
      submitWord();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearSelection();
    } else if (e.key === ' ' && !e.target?.toString().includes('Input')) {
      e.preventDefault();
      shuffleTiles();
    } else if (e.key === 'Backspace' && !e.target?.toString().includes('Input')) {
      e.preventDefault();
      const lastId = selectedTileIds[selectedTileIds.length - 1];
      if (lastId) {
        deselectTile(lastId);
      }
    }
  }, [submitWord, clearSelection, shuffleTiles, selectedTileIds, deselectTile]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const loading = isLoading || isPending;

  // Welcome/Setup screen
  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900">
              OpenQuartiles
            </h1>
            <p className="text-gray-500 mt-2">Build words from tiles. Find all 5 Quartiles!</p>
          </div>

          <div className="space-y-4">
            {/* Daily Puzzle Button */}
            <motion.button
              onClick={handleStartDaily}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-lg",
                "flex items-center justify-center gap-3",
                "transition-colors duration-150",
                loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Daily Puzzle
                </>
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or</span>
              </div>
            </div>

            {/* Custom Theme */}
            <form onSubmit={handleStartGame} className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom theme
                </label>
                <input
                  type="text"
                  value={inputTheme}
                  onChange={(e) => setInputTheme(e.target.value)}
                  placeholder="e.g., nature, food, technology..."
                  disabled={loading}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border border-gray-200",
                    "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent",
                    "placeholder:text-gray-400",
                    "disabled:bg-gray-100 disabled:cursor-not-allowed"
                  )}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={cn(
                  "w-full py-3 rounded-xl font-medium",
                  "flex items-center justify-center gap-2",
                  "transition-colors duration-150",
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                <Shuffle className="w-4 h-4" />
                {inputTheme ? `Start with "${inputTheme}"` : 'Random Theme'}
              </motion.button>
            </form>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto"
            >
              <HelpCircle className="w-4 h-4" />
              How to play
            </button>
          </div>
        </motion.div>

        <HowToPlayModal />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            OpenQuartiles
          </h1>
          {puzzle.theme && (
            <p className="text-sm text-gray-500">
              {puzzle.theme}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHowToPlay(true)}
            className={cn(
              "p-2 rounded-lg",
              "bg-white border border-gray-200",
              "text-gray-600 hover:text-gray-900",
              "hover:border-gray-300",
              "transition-colors duration-150",
              "shadow-sm"
            )}
            aria-label="How to play"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewGame}
            disabled={loading}
            className={cn(
              "p-2 rounded-lg",
              "bg-white border border-gray-200",
              "text-gray-600 hover:text-gray-900",
              "hover:border-gray-300",
              "transition-colors duration-150",
              "shadow-sm",
              loading && "opacity-50 cursor-not-allowed"
            )}
            aria-label="New puzzle"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCcw className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Score Display */}
      <ScoreDisplay />

      {/* Word Builder */}
      <WordBuilder />

      {/* Game Board */}
      <GameBoard />

      {/* Action Buttons */}
      <ActionButtons />

      {/* Found Words */}
      <FoundWordsList />

      {/* New Theme Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4"
      >
        <button
          onClick={resetGame}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Try a different puzzle
        </button>
      </motion.div>

      {/* Modals */}
      <HowToPlayModal />
      <GameComplete />
    </div>
  );
}
