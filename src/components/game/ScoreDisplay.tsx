// src/components/game/ScoreDisplay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { getRankProgress, SCORING } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy, Zap, Star } from 'lucide-react';

const RANK_CONFIG = {
  Beginner: { color: 'from-gray-400 to-gray-500', icon: '🌱', threshold: 0 },
  Novice: { color: 'from-emerald-400 to-teal-500', icon: '🌿', threshold: 25 },
  Skilled: { color: 'from-blue-400 to-indigo-500', icon: '⭐', threshold: 50 },
  Expert: { color: 'from-purple-400 to-pink-500', icon: '🏆', threshold: 75 },
  Master: { color: 'from-amber-400 to-orange-500', icon: '👑', threshold: 100 },
  Genius: { color: 'from-rose-400 to-red-500', icon: '🧠', threshold: 100 },
};

export function ScoreDisplay() {
  const { score, quartilesFound, getRank } = useGameStore();
  const rank = getRank();
  const progress = getRankProgress(score);
  const config = RANK_CONFIG[rank];

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 shadow-sm">
        {/* Score and Rank Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Score */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              "bg-gradient-to-br", config.color
            )}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={score}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {score}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-gray-500 ml-1">pts</span>
            </div>
          </div>

          {/* Rank Badge */}
          <motion.div 
            className={cn(
              "px-3 py-1.5 rounded-full font-semibold text-white text-sm",
              "bg-gradient-to-r shadow-md",
              config.color
            )}
            whileHover={{ scale: 1.05 }}
          >
            <span className="mr-1">{config.icon}</span>
            {rank}
          </motion.div>

          {/* Quartiles Found */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">{quartilesFound}</span>
              <span className="text-sm text-gray-500">/5</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full bg-gradient-to-r rounded-full", config.color)}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Rank thresholds */}
          {[25, 50, 75, 100].map((threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>

        {/* Points legend */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2 tiles = {SCORING.TWO_TILES}pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              3 tiles = {SCORING.THREE_TILES}pts
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              4 tiles = {SCORING.FOUR_TILES}pts
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



