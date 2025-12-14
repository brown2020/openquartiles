// src/components/game/ActionButtons.tsx
'use client';

import { motion } from 'framer-motion';
import { Shuffle, Trash2, Check, Lightbulb } from 'lucide-react';
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

  const hasSelection = selectedTileIds.length > 0;
  const canSubmit = selectedTileIds.length >= 2;

  const handleHint = () => {
    const hint = useHint();
    if (hint) {
      // Could show this in a toast or modal
      console.log('Hint:', hint);
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center gap-3 sm:gap-4"
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
          "p-3 sm:p-4 rounded-xl",
          "bg-white/80 backdrop-blur-sm",
          "border border-gray-200",
          "text-gray-600 hover:text-gray-900",
          "hover:bg-white hover:border-gray-300",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md"
        )}
        aria-label="Shuffle tiles"
      >
        <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      {/* Clear Button */}
      <motion.button
        whileHover={hasSelection ? { scale: 1.05 } : {}}
        whileTap={hasSelection ? { scale: 0.95 } : {}}
        onClick={clearSelection}
        disabled={!hasSelection}
        className={cn(
          "p-3 sm:p-4 rounded-xl",
          "transition-all duration-200",
          hasSelection
            ? [
                "bg-rose-50 border border-rose-200",
                "text-rose-600 hover:text-rose-700",
                "hover:bg-rose-100 hover:border-rose-300",
                "shadow-sm hover:shadow-md"
              ]
            : [
                "bg-gray-100 border border-gray-200",
                "text-gray-400",
                "cursor-not-allowed"
              ]
        )}
        aria-label="Clear selection"
      >
        <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      {/* Submit Button */}
      <motion.button
        whileHover={canSubmit ? { scale: 1.05 } : {}}
        whileTap={canSubmit ? { scale: 0.95 } : {}}
        onClick={submitWord}
        disabled={!canSubmit}
        className={cn(
          "px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg",
          "flex items-center gap-2",
          "transition-all duration-200",
          canSubmit
            ? [
                "bg-gradient-to-r from-orange-500 to-rose-500",
                "text-white",
                "shadow-lg shadow-orange-400/30",
                "hover:shadow-xl hover:shadow-orange-400/40",
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
          "p-3 sm:p-4 rounded-xl relative",
          "bg-amber-50 border border-amber-200",
          "text-amber-600 hover:text-amber-700",
          "hover:bg-amber-100 hover:border-amber-300",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md"
        )}
        aria-label="Get hint"
      >
        <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
        {hintsUsed > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
            {hintsUsed}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}



