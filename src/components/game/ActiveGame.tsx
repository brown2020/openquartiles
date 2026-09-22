'use client';

import { HelpCircle, RefreshCcw, Loader2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { GameBoard } from './GameBoard';
import { WordBuilder } from './WordBuilder';
import { ActionButtons } from './ActionButtons';
import { ScoreDisplay } from './ScoreDisplay';
import { FoundWordsList } from './FoundWordsList';
import { HowToPlayModal } from './HowToPlayModal';
import { GameComplete } from './GameComplete';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ActiveGameProps {
  loading: boolean;
  onNewGame: () => void;
}

export function ActiveGame({ loading, onNewGame }: ActiveGameProps) {
  const { puzzle, setShowHowToPlay, resetGame } = useGameStore();

  if (!puzzle) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OpenQuartiles</h1>
          {puzzle.theme && <p className="text-sm text-gray-500">{puzzle.theme}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className={cn(
              'p-2 rounded-lg text-sm',
              'bg-white border border-gray-200',
              'text-gray-600 hover:text-gray-900 hover:border-gray-300',
              'transition-colors duration-150 shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
            )}
          >
            About
          </Link>
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className={cn(
              'p-2 rounded-lg',
              'bg-white border border-gray-200',
              'text-gray-600 hover:text-gray-900 hover:border-gray-300',
              'transition-colors duration-150 shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
            )}
            aria-label="How to play"
          >
            <HelpCircle className="w-5 h-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={onNewGame}
            disabled={loading}
            className={cn(
              'p-2 rounded-lg',
              'bg-white border border-gray-200',
              'text-gray-600 hover:text-gray-900 hover:border-gray-300',
              'transition-colors duration-150 shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
              loading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="New puzzle"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            ) : (
              <RefreshCcw className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>
      </header>

      <ScoreDisplay />
      <WordBuilder />
      <GameBoard />
      <ActionButtons />
      <FoundWordsList />

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={resetGame}
          className="text-sm text-gray-500 hover:text-gray-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
        >
          Try a different puzzle
        </button>
      </div>

      <HowToPlayModal />
      <GameComplete />
    </div>
  );
}
