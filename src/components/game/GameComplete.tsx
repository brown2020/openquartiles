// src/components/game/GameComplete.tsx
'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Trophy, Star, RefreshCcw, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GameComplete() {
  const { 
    isComplete, 
    score, 
    quartilesFound, 
    foundWords, 
    getRank,
    resetGame,
    stats 
  } = useGameStore();

  if (!isComplete) return null;

  const rank = getRank();
  const allQuartilesFound = quartilesFound === 5;

  const handleShare = () => {
    const text = `🧩 Quartiles\n\n` +
      `Score: ${score}\n` +
      `Rank: ${rank}\n` +
      `Quartiles: ${quartilesFound}/5 ⭐\n` +
      `Words: ${foundWords.length}\n\n` +
      `Play at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-40"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20 backdrop-blur-sm"
      />

      {/* Content */}
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header with confetti effect */}
        <div className="relative bg-gradient-to-r from-orange-500 to-rose-500 p-8 text-center text-white overflow-hidden">
          {/* Animated background shapes */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30"
                initial={{
                  x: Math.random() * 400 - 200,
                  y: -20,
                  opacity: 0,
                }}
                animate={{
                  y: 200,
                  opacity: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="relative z-10"
          >
            {allQuartilesFound ? (
              <div className="text-6xl mb-2">🧠</div>
            ) : (
              <Trophy className="w-16 h-16 mx-auto mb-2" />
            )}
            <h2 className="text-3xl font-bold">
              {allQuartilesFound ? 'Genius!' : 'Puzzle Complete!'}
            </h2>
            <p className="text-white/80 mt-1">
              {allQuartilesFound 
                ? 'You found all the Quartiles!' 
                : 'Great job completing the puzzle!'}
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Score and Rank */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <StatCard
              label="Score"
              value={score.toString()}
              icon={<Trophy className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              label="Rank"
              value={rank}
              icon={<Star className="w-5 h-5 text-purple-500" />}
            />
            <StatCard
              label="Quartiles"
              value={`${quartilesFound}/5`}
              icon={<Star className="w-5 h-5 text-indigo-500" />}
            />
          </div>

          {/* Words Found Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Words Found</div>
            <div className="flex flex-wrap gap-1.5">
              {foundWords.slice(0, 10).map((word) => (
                <span
                  key={word.word}
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    word.isQuartile
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-200 text-gray-700"
                  )}
                >
                  {word.word}
                </span>
              ))}
              {foundWords.length > 10 && (
                <span className="px-2 py-0.5 text-xs text-gray-400">
                  +{foundWords.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Streak */}
          {stats.currentStreak > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-xl p-3"
            >
              <span className="text-2xl">🔥</span>
              <span className="font-bold">{stats.currentStreak} Day Streak!</span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetGame}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold",
                "bg-gradient-to-r from-orange-500 to-rose-500",
                "text-white shadow-lg shadow-orange-400/30",
                "flex items-center justify-center gap-2"
              )}
            >
              <RefreshCcw className="w-5 h-5" />
              New Game
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className={cn(
                "px-4 py-3 rounded-xl font-semibold",
                "bg-gray-100 text-gray-700",
                "border border-gray-200",
                "flex items-center justify-center"
              )}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

