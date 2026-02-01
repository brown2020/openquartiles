// src/components/game/ActionButtons.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Trash2, Check, Lightbulb, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function ActionButtons() {
  const {
    selectedTileIds,
    submitWord,
    clearSelection,
    shuffleTiles,
    useHint,
    hintsUsed,
  } = useGameStore();

  const [currentHint, setCurrentHint] = useState<string | null>(null);

  const hasSelection = selectedTileIds.length > 0;
  const canSubmit = selectedTileIds.length >= 1;

  const handleHint = () => {
    const hint = useHint();
    if (hint) {
      setCurrentHint(hint);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setCurrentHint(null), 5000);
    }
  };

  const dismissHint = () => {
    setCurrentHint(null);
  };

  return (
    <div className="space-y-3">
      {/* Hint Display */}
      <AnimatePresence>
        {currentHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Hint: <span className="font-bold">{currentHint}</span>
            </span>
            <button
              onClick={dismissHint}
              className="ml-2 p-1 hover:bg-amber-100 rounded"
            >
              <X className="w-3 h-3 text-amber-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        className="flex items-center justify-center gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Shuffle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shuffleTiles}
          className={cn(
            "p-3 rounded-lg",
            "bg-white",
            "border border-gray-200",
            "text-gray-600 hover:text-gray-900",
            "hover:border-gray-300",
            "transition-colors duration-150",
            "shadow-sm"
          )}
          aria-label="Shuffle tiles"
        >
          <Shuffle className="w-5 h-5" />
        </motion.button>

        {/* Clear Button */}
        <motion.button
          whileHover={hasSelection ? { scale: 1.05 } : {}}
          whileTap={hasSelection ? { scale: 0.95 } : {}}
          onClick={clearSelection}
          disabled={!hasSelection}
          className={cn(
            "p-3 rounded-lg",
            "transition-colors duration-150",
            hasSelection
              ? [
                  "bg-white border border-gray-200",
                  "text-gray-600 hover:text-gray-900",
                  "hover:border-gray-300",
                  "shadow-sm"
                ]
              : [
                  "bg-gray-100 border border-gray-200",
                  "text-gray-400",
                  "cursor-not-allowed"
                ]
          )}
          aria-label="Clear selection"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>

        {/* Submit Button */}
        <motion.button
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
          onClick={submitWord}
          disabled={!canSubmit}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold text-base",
            "flex items-center gap-2",
            "transition-colors duration-150",
            canSubmit
              ? [
                  "bg-gray-900",
                  "text-white",
                  "shadow-sm",
                  "hover:bg-gray-800",
                ]
              : [
                  "bg-gray-200",
                  "text-gray-400",
                  "cursor-not-allowed"
                ]
          )}
          aria-label="Submit word"
        >
          <Check className="w-5 h-5" />
          <span>Submit</span>
        </motion.button>

        {/* Hint Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHint}
          className={cn(
            "p-3 rounded-lg relative",
            "bg-white border border-gray-200",
            "text-gray-600 hover:text-gray-900",
            "hover:border-gray-300",
            "transition-colors duration-150",
            "shadow-sm"
          )}
          aria-label="Get hint"
        >
          <Lightbulb className="w-5 h-5" />
          {hintsUsed > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
              {hintsUsed}
            </span>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
