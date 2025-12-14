// src/components/game/FoundWordsList.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { Star, Sparkles } from 'lucide-react';

export function FoundWordsList() {
  const { foundWords } = useGameStore();

  if (foundWords.length === 0) {
    return null;
  }

  // Group words by tile count
  const quartiles = foundWords.filter(w => w.tileCount === 4);
  const threeLetters = foundWords.filter(w => w.tileCount === 3);
  const twoLetters = foundWords.filter(w => w.tileCount === 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Found Words ({foundWords.length})
        </h3>

        <div className="space-y-3">
          {/* Quartiles (4 tiles) */}
          {quartiles.length > 0 && (
            <WordGroup
              title="Quartiles"
              words={quartiles}
              color="from-purple-500 to-indigo-500"
              icon={<Star className="w-3 h-3" />}
            />
          )}

          {/* 3-tile words */}
          {threeLetters.length > 0 && (
            <WordGroup
              title="3 Tiles"
              words={threeLetters}
              color="from-orange-400 to-rose-400"
            />
          )}

          {/* 2-tile words */}
          {twoLetters.length > 0 && (
            <WordGroup
              title="2 Tiles"
              words={twoLetters}
              color="from-amber-400 to-orange-400"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface WordGroupProps {
  title: string;
  words: Array<{ word: string; points: number; isQuartile: boolean }>;
  color: string;
  icon?: React.ReactNode;
}

function WordGroup({ title, words, color, icon }: WordGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full text-white",
          "bg-gradient-to-r", color
        )}>
          {icon}
          {title}
        </span>
        <span className="text-xs text-gray-400">
          +{words.reduce((sum, w) => sum + w.points, 0)} pts
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {words.map((word, index) => (
            <motion.span
              key={word.word}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-sm font-medium",
                word.isQuartile
                  ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              )}
            >
              {word.word}
              <span className="ml-1 text-xs opacity-60">+{word.points}</span>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}



