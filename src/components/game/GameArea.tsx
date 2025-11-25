// src/components/game/GameArea.tsx
'use client';

import { useEffect, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RefreshCcw, Sparkles, Loader2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { generatePuzzle } from '@/lib/actions';
import { GameBoard } from './GameBoard';
import { WordBuilder } from './WordBuilder';
import { ActionButtons } from './ActionButtons';
import { ScoreDisplay } from './ScoreDisplay';
import { FoundWordsList } from './FoundWordsList';
import { WordBreakdown } from './WordBreakdown';
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

  // Handle form submission
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      handleGeneratePuzzle(inputTheme || undefined);
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
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: 'linear' }}
            >
              <Sparkles className="w-16 h-16 mx-auto text-orange-500" />
            </motion.div>
            <h1 className="text-4xl font-black mt-4 bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              Quartiles
            </h1>
            <p className="text-gray-600 mt-2">Build words from tiles. Find all 5 Quartiles!</p>
          </div>

          <form onSubmit={handleStartGame} className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a theme (optional)
              </label>
              <input
                type="text"
                value={inputTheme}
                onChange={(e) => setInputTheme(e.target.value)}
                placeholder="e.g., nature, food, technology..."
                disabled={loading}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border border-gray-200",
                  "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent",
                  "placeholder:text-gray-400",
                  "disabled:bg-gray-100 disabled:cursor-not-allowed"
                )}
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty for a random theme
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-lg",
                "flex items-center justify-center gap-3",
                "transition-all duration-200",
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : [
                      "bg-gradient-to-r from-orange-500 to-rose-500",
                      "text-white",
                      "shadow-lg shadow-orange-400/30",
                      "hover:shadow-xl hover:shadow-orange-400/40",
                    ]
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating puzzle...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Game
                </>
              )}
            </motion.button>
          </form>

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
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            Quartiles
          </h1>
          {puzzle.theme && (
            <p className="text-sm text-gray-500">
              Theme: <span className="font-medium text-gray-700">{puzzle.theme}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHowToPlay(true)}
            className={cn(
              "p-2.5 rounded-xl",
              "bg-white/80 backdrop-blur-sm",
              "border border-gray-200",
              "text-gray-600 hover:text-gray-900",
              "hover:bg-white hover:border-gray-300",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md"
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
              "p-2.5 rounded-xl",
              "bg-white/80 backdrop-blur-sm",
              "border border-gray-200",
              "text-gray-600 hover:text-gray-900",
              "hover:bg-white hover:border-gray-300",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md",
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

      {/* Word Breakdown - shows target words */}
      <WordBreakdown />

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
          Try a different theme
        </button>
      </motion.div>

      {/* Modals */}
      <HowToPlayModal />
      <GameComplete />
    </div>
  );
}
