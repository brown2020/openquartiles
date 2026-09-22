'use client';

import { useEffect, useId, useRef } from 'react';
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
    stats,
  } = useGameStore();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isComplete) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [isComplete]);

  const rank = getRank();
  const allQuartilesFound = quartilesFound === 5;

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text =
      `🧩 Quartiles\n\n` +
      `Score: ${score}\n` +
      `Rank: ${rank}\n` +
      `Quartiles: ${quartilesFound}/5 ⭐\n` +
      `Words: ${foundWords.length}\n\n` +
      `Play at: ${url}`;

    if (navigator.share) {
      void navigator.share({ text });
    } else {
      void navigator.clipboard.writeText(text);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-w-md w-[calc(100%-2rem)] rounded-3xl border-0 bg-transparent p-0 shadow-2xl open:block backdrop:bg-gradient-to-br backdrop:from-orange-500/20 backdrop:to-rose-500/20 backdrop:backdrop-blur-sm"
      onCancel={(e) => e.preventDefault()}
    >
      <div className="bg-white rounded-3xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-orange-500 to-rose-500 p-8 text-center text-white overflow-hidden">
          <div className="relative z-10">
            {allQuartilesFound ? (
              <div className="text-6xl mb-2" aria-hidden>
                🧠
              </div>
            ) : (
              <Trophy className="w-16 h-16 mx-auto mb-2" aria-hidden />
            )}
            <h2 id={titleId} className="text-3xl font-bold">
              {allQuartilesFound ? 'Genius!' : 'Puzzle Complete!'}
            </h2>
            <p className="text-white/80 mt-1">
              {allQuartilesFound
                ? 'You found all the Quartiles!'
                : 'Great job completing the puzzle!'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <StatCard
              label="Score"
              value={score.toString()}
              icon={<Trophy className="w-5 h-5 text-amber-500" aria-hidden />}
            />
            <StatCard
              label="Rank"
              value={rank}
              icon={<Star className="w-5 h-5 text-purple-500" aria-hidden />}
            />
            <StatCard
              label="Quartiles"
              value={`${quartilesFound}/5`}
              icon={<Star className="w-5 h-5 text-indigo-500" aria-hidden />}
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-500 mb-2">Words Found</div>
            <div className="flex flex-wrap gap-1.5">
              {foundWords.slice(0, 10).map((word) => (
                <span
                  key={word.word}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    word.isQuartile
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-200 text-gray-700'
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

          {stats.currentStreak > 1 && (
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-xl p-3">
              <span className="text-2xl" aria-hidden>
                🔥
              </span>
              <span className="font-bold">{stats.currentStreak} Day Streak!</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetGame}
              className={cn(
                'flex-1 py-3 rounded-xl font-semibold',
                'bg-gradient-to-r from-orange-500 to-rose-500',
                'text-white shadow-lg shadow-orange-400/30',
                'flex items-center justify-center gap-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400'
              )}
            >
              <RefreshCcw className="w-5 h-5" aria-hidden />
              New Game
            </button>

            <button
              type="button"
              onClick={handleShare}
              className={cn(
                'px-4 py-3 rounded-xl font-semibold',
                'bg-gray-100 text-gray-700 border border-gray-200',
                'flex items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
              )}
              aria-label="Share results"
            >
              <Share2 className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function StatCard({
  label,
  value,
  icon,
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
