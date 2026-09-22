'use client';

import { useEffect, useRef } from 'react';
import { X, Star, Zap, Trophy, Keyboard } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { SCORING } from '@/lib/types';
import { cn } from '@/lib/utils';

export function HowToPlayModal() {
  const { showHowToPlay, setShowHowToPlay } = useGameStore();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (showHowToPlay) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [showHowToPlay]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="how-to-play-title"
      className="fixed inset-0 m-auto max-h-[calc(100vh-2rem)] sm:max-h-[80vh] w-[calc(100%-2rem)] max-w-lg rounded-2xl border-0 bg-transparent p-0 shadow-2xl open:flex open:flex-col backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      onClose={() => setShowHowToPlay(false)}
      onCancel={(e) => {
        e.preventDefault();
        setShowHowToPlay(false);
      }}
    >
      <div className="bg-white rounded-2xl overflow-hidden max-h-[inherit] flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-6 text-white relative">
          <button
            type="button"
            onClick={() => setShowHowToPlay(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
          <h2 id="how-to-play-title" className="text-2xl font-bold">
            How to Play
          </h2>
          <p className="text-white/80 mt-1">Learn the rules of Quartiles</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <section>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" aria-hidden />
              Goal
            </h3>
            <p className="text-gray-600">
              Build words by combining tiles. Find all five <strong>Quartiles</strong>{' '}
              (4-tile words) to earn the bonus and reach <strong>Expert</strong> rank!
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-500" aria-hidden />
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </span>
                <span>Tap tiles to select them and build a word</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </span>
                <span>Select 1–4 tiles to form valid English words</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </span>
                <span>Press Submit to check your word</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </span>
                <span>Valid words score points; Quartiles remove their tiles</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-500" aria-hidden />
              Scoring
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ScoreCard tiles={1} points={SCORING.ONE_TILE} />
              <ScoreCard tiles={2} points={SCORING.TWO_TILES} />
              <ScoreCard tiles={3} points={SCORING.THREE_TILES} />
              <ScoreCard tiles={4} points={SCORING.FOUR_TILES} isQuartile />
              <ScoreCard
                label="All 5 Quartiles"
                points={SCORING.ALL_QUARTILES_BONUS}
                isBonus
              />
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-2">
              <Keyboard className="w-5 h-5 text-gray-500" aria-hidden />
              Keyboard Shortcuts
            </h3>
            <div className="flex flex-wrap gap-2">
              <Shortcut keys={['Enter']} action="Submit word" />
              <Shortcut keys={['Esc']} action="Clear selection" />
              <Shortcut keys={['⌫']} action="Undo last tile" />
              <Shortcut keys={['Space']} action="Shuffle tiles" />
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Ranks</h3>
            <div className="flex flex-wrap gap-2">
              <RankBadge rank="Beginner" points="0" icon="🌱" />
              <RankBadge rank="Novice" points="25" icon="🌿" />
              <RankBadge rank="Skilled" points="50" icon="⭐" />
              <RankBadge rank="Expert" points="75" icon="🏆" />
              <RankBadge rank="Master" points="100" icon="👑" />
              <RankBadge rank="Genius" points="100+" icon="🧠" special />
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowHowToPlay(false)}
            className={cn(
              'w-full py-3 rounded-xl font-semibold',
              'bg-gradient-to-r from-orange-500 to-rose-500',
              'text-white shadow-lg shadow-orange-400/30',
              'hover:shadow-xl transition-shadow',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400'
            )}
          >
            Got it, let&apos;s play!
          </button>
        </div>
      </div>
    </dialog>
  );
}

function ScoreCard({
  tiles,
  points,
  label,
  isQuartile,
  isBonus,
}: {
  tiles?: number;
  points: number;
  label?: string;
  isQuartile?: boolean;
  isBonus?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-xl border text-center',
        isBonus
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          : isQuartile
            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
            : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="text-sm text-gray-600 mb-1">
        {label || `${tiles} Tiles`}
        {isQuartile && <Star className="w-3 h-3 inline ml-1 text-purple-500" aria-hidden />}
      </div>
      <div
        className={cn(
          'text-xl font-bold',
          isBonus ? 'text-amber-600' : isQuartile ? 'text-purple-600' : 'text-gray-900'
        )}
      >
        +{points}
      </div>
    </div>
  );
}

function Shortcut({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
      <div className="flex gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="px-2 py-0.5 bg-white rounded border border-gray-300 text-xs font-mono text-gray-700"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-xs text-gray-500">{action}</span>
    </div>
  );
}

function RankBadge({
  rank,
  points,
  icon,
  special,
}: {
  rank: string;
  points: string;
  icon: string;
  special?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
        special
          ? 'bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 border border-rose-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200'
      )}
    >
      <span>{icon}</span>
      <span className="font-medium">{rank}</span>
      <span className="text-gray-400">({points})</span>
    </div>
  );
}
