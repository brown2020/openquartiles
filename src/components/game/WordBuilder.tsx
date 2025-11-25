// src/components/game/WordBuilder.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function WordBuilder() {
  const { 
    tiles, 
    selectedTileIds, 
    lastAttemptedWord, 
    lastAttemptResult 
  } = useGameStore();

  const currentWord = selectedTileIds
    .map(id => tiles.find(t => t.id === id)?.text || '')
    .join('');

  const getResultMessage = () => {
    if (!lastAttemptResult) return null;
    switch (lastAttemptResult) {
      case 'correct':
        return { text: `${lastAttemptedWord} ✓`, color: 'text-emerald-500' };
      case 'incorrect':
        return { text: `${lastAttemptedWord} ✗`, color: 'text-rose-500' };
      case 'already-found':
        return { text: `Already found!`, color: 'text-amber-500' };
    }
  };

  const resultMessage = getResultMessage();

  return (
    <div className="h-20 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {currentWord ? (
          <motion.div
            key="word"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
          >
            <motion.span 
              className={cn(
                "text-3xl sm:text-4xl font-bold tracking-wide",
                "bg-gradient-to-r from-orange-500 to-rose-500",
                "bg-clip-text text-transparent"
              )}
              layout
            >
              {currentWord}
            </motion.span>
            
            {/* Tile count indicator */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "absolute -right-8 top-0 text-sm font-medium px-2 py-0.5 rounded-full",
                selectedTileIds.length === 4 
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" 
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {selectedTileIds.length === 4 ? '★' : selectedTileIds.length}
            </motion.span>
          </motion.div>
        ) : resultMessage ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn("text-2xl font-semibold", resultMessage.color)}
          >
            {resultMessage.text}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-400 text-lg"
          >
            Select tiles to build a word
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


