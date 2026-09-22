'use client';

import { useGameStore } from '@/stores/gameStore';
import { getRankProgress } from '@/lib/types';
import { cn } from '@/lib/utils';

const RANK_CONFIG = {
  Beginner: { color: 'bg-gray-400', label: 'Beginner' },
  Novice: { color: 'bg-emerald-500', label: 'Novice' },
  Skilled: { color: 'bg-blue-500', label: 'Skilled' },
  Expert: { color: 'bg-purple-500', label: 'Expert' },
  Master: { color: 'bg-amber-500', label: 'Master' },
  Genius: { color: 'bg-rose-500', label: 'Genius' },
};

export function ScoreDisplay() {
  const { score, quartilesFound, getRank } = useGameStore();
  const rank = getRank();
  const progress = getRankProgress(score);
  const config = RANK_CONFIG[rank];

  return (
    <div className="w-full max-w-md mx-auto" aria-live="polite">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{score}</span>
            <span className="text-sm text-gray-500">points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Quartiles</span>
            <span className="text-xl font-bold text-gray-900">{quartilesFound}</span>
            <span className="text-gray-400">/5</span>
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="relative h-2 bg-gray-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.min(progress, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Rank progress ${Math.round(progress)} percent`}
          >
            <div
              className={cn('h-full rounded-full transition-[width] duration-500 ease-out', config.color)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            {[25, 50, 75].map((threshold) => (
              <div
                key={threshold}
                className="absolute top-0 bottom-0 w-0.5 bg-white"
                style={{ left: `${threshold}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium text-white',
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}
