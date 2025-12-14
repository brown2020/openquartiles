// src/components/game/WordBreakdown.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Check, Lock } from 'lucide-react';

export function WordBreakdown() {
  const { 
    puzzle, 
    foundWords, 
    showWordBreakdown, 
    setShowWordBreakdown 
  } = useGameStore();

  if (!puzzle) return null;

  const quartiles = puzzle.quartiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-md mx-auto mt-4"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
        {/* Header with toggle */}
        <button
          onClick={() => setShowWordBreakdown(!showWordBreakdown)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Word Breakdown
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              {foundWords.filter(w => w.isQuartile).length}/{quartiles.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">{showWordBreakdown ? 'Hide' : 'Show'}</span>
            {showWordBreakdown ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Word list */}
        <AnimatePresence>
          {showWordBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {quartiles.map((quartile, index) => {
                  const isFound = foundWords.some(fw => fw.word === quartile.word);
                  const chunks = getChunksForWord(puzzle, quartile);

                  return (
                    <WordRow
                      key={quartile.word}
                      word={quartile.word}
                      chunks={chunks}
                      isFound={isFound}
                      index={index}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface WordRowProps {
  word: string;
  chunks: string[];
  isFound: boolean;
  index: number;
}

function WordRow({ word, chunks, isFound, index }: WordRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all",
        isFound 
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200" 
          : "bg-gray-50 border border-gray-200"
      )}
    >
      {/* Status icon */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isFound 
          ? "bg-emerald-500 text-white" 
          : "bg-gray-200 text-gray-400"
      )}>
        {isFound ? (
          <Check className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>

      {/* Word chunks */}
      <div className="flex-1">
        <div className="flex flex-wrap gap-1">
          {chunks.map((chunk, chunkIndex) => (
            <span
              key={chunkIndex}
              className={cn(
                "px-2 py-1 rounded text-sm font-mono font-semibold",
                isFound
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {isFound ? chunk : '???'}
            </span>
          ))}
        </div>
        
        {/* Full word (only if found) */}
        {isFound && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-emerald-600 font-semibold mt-1"
          >
            {word}
          </motion.div>
        )}
      </div>

      {/* Points */}
      <div className={cn(
        "text-sm font-bold flex-shrink-0",
        isFound ? "text-emerald-600" : "text-gray-400"
      )}>
        {isFound ? '+8' : '8 pts'}
      </div>
    </motion.div>
  );
}

function getChunksForWord(puzzle: { tiles: string[]; quartiles: { word: string; tileIds: string[] }[] }, quartile: { word: string; tileIds: string[] }): string[] {
  return quartile.tileIds.map(id => {
    const index = parseInt(id.replace('tile-', ''));
    return puzzle.tiles[index];
  });
}



