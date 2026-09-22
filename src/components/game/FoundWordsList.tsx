'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FoundWordsList() {
  const { foundWords } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (foundWords.length === 0) {
    return null;
  }

  const quartiles = foundWords.filter((w) => w.isQuartile || w.tileCount >= 4);
  const threeLetters = foundWords.filter((w) => !w.isQuartile && w.tileCount === 3);
  const twoLetters = foundWords.filter((w) => !w.isQuartile && w.tileCount === 2);
  const oneLetters = foundWords.filter((w) => !w.isQuartile && w.tileCount === 1);
  const totalPoints = foundWords.reduce((sum, w) => sum + w.points, 0);

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Words Found</span>
            <span className="text-sm text-gray-500">
              {foundWords.length} ({totalPoints} pts)
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            {quartiles.length > 0 && (
              <WordGroup title="Quartiles" words={quartiles} badgeColor="bg-emerald-500" />
            )}
            {threeLetters.length > 0 && (
              <WordGroup title="3 Tiles" words={threeLetters} badgeColor="bg-blue-500" />
            )}
            {twoLetters.length > 0 && (
              <WordGroup title="2 Tiles" words={twoLetters} badgeColor="bg-amber-500" />
            )}
            {oneLetters.length > 0 && (
              <WordGroup title="1 Tile" words={oneLetters} badgeColor="bg-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WordGroupProps {
  title: string;
  words: Array<{ word: string; points: number; isQuartile: boolean }>;
  badgeColor: string;
}

function WordGroup({ title, words, badgeColor }: WordGroupProps) {
  return (
    <div className="pt-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full text-white',
            badgeColor
          )}
        >
          {title}
        </span>
        <span className="text-xs text-gray-400">
          +{words.reduce((sum, w) => sum + w.points, 0)} pts
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {words.map((word) => (
          <span
            key={word.word}
            className={cn(
              'px-2 py-1 rounded-md text-sm',
              word.isQuartile
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            )}
          >
            {word.word}
          </span>
        ))}
      </div>
    </div>
  );
}
