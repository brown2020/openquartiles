'use client';

import { useState, useRef, useEffect } from 'react';
import { Shuffle, Trash2, Check, Lightbulb, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function ActionButtons() {
  const {
    selectedTileIds,
    submitWord,
    clearSelection,
    shuffleTiles,
    getHint,
    hintsUsed,
  } = useGameStore();

  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const hasSelection = selectedTileIds.length > 0;
  const canSubmit = selectedTileIds.length >= 1;

  const handleHint = () => {
    const hint = getHint();
    if (hint) {
      setCurrentHint(hint);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => setCurrentHint(null), 5000);
    }
  };

  const dismissHint = () => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setCurrentHint(null);
  };

  return (
    <div className="space-y-3">
      {currentHint && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg"
          role="status"
        >
          <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden />
          <span className="text-sm font-medium text-amber-800">
            Hint: <span className="font-bold">{currentHint}</span>
          </span>
          <button
            type="button"
            onClick={dismissHint}
            className="ml-2 p-2 hover:bg-amber-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Dismiss hint"
          >
            <X className="w-4 h-4 text-amber-600" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={shuffleTiles}
          className={cn(
            'p-3 rounded-lg',
            'bg-white border border-gray-200',
            'text-gray-600 hover:text-gray-900 hover:border-gray-300',
            'transition-colors duration-150 shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
          )}
          aria-label="Shuffle tiles"
        >
          <Shuffle className="w-5 h-5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={clearSelection}
          disabled={!hasSelection}
          className={cn(
            'p-3 rounded-lg transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
            hasSelection
              ? 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 shadow-sm'
              : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Clear selection"
        >
          <Trash2 className="w-5 h-5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={submitWord}
          disabled={!canSubmit}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold text-base',
            'flex items-center gap-2 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
            canSubmit
              ? 'bg-gray-900 text-white shadow-sm hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Submit word"
        >
          <Check className="w-5 h-5" aria-hidden />
          <span>Submit</span>
        </button>

        <button
          type="button"
          onClick={handleHint}
          className={cn(
            'p-3 rounded-lg relative',
            'bg-white border border-gray-200',
            'text-gray-600 hover:text-gray-900 hover:border-gray-300',
            'transition-colors duration-150 shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
          )}
          aria-label="Get hint"
        >
          <Lightbulb className="w-5 h-5" aria-hidden />
          {hintsUsed > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
              {hintsUsed}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
