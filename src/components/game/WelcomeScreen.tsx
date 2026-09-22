'use client';

import Link from 'next/link';
import { HelpCircle, Loader2, Calendar, Shuffle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { HowToPlayModal } from './HowToPlayModal';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  loading: boolean;
  onStartDaily: () => void;
  onStartCustom: (e: React.FormEvent) => void;
}

export function WelcomeScreen({
  loading,
  onStartDaily,
  onStartCustom,
}: WelcomeScreenProps) {
  const { inputTheme, setInputTheme, error, setShowHowToPlay } = useGameStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900">OpenQuartiles</h1>
          <p className="text-gray-500 mt-2">
            Build words from tiles. Find all 5 Quartiles!
          </p>
        </header>

        <div className="space-y-4">
          <button
            type="button"
            onClick={onStartDaily}
            disabled={loading}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg',
              'flex items-center justify-center gap-3',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
              loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                Loading...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" aria-hidden />
                Daily Puzzle
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={onStartCustom} className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <label
                htmlFor="theme-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Custom theme
              </label>
              <input
                id="theme-input"
                name="theme"
                type="text"
                value={inputTheme}
                onChange={(e) => setInputTheme(e.target.value)}
                placeholder="e.g., nature, food, technology..."
                disabled={loading}
                autoComplete="off"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent',
                  'placeholder:text-gray-400',
                  'disabled:bg-gray-100 disabled:cursor-not-allowed'
                )}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3 rounded-xl font-medium',
                'flex items-center justify-center gap-2',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400',
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              <Shuffle className="w-4 h-4" aria-hidden />
              {inputTheme ? `Start with "${inputTheme}"` : 'Random Theme'}
            </button>
          </form>
        </div>

        {error && (
          <div
            className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
          >
            <HelpCircle className="w-4 h-4" aria-hidden />
            How to play
          </button>
          <Link
            href="/about"
            className="block text-sm text-gray-600 hover:text-gray-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
          >
            About
          </Link>
        </div>
      </div>

      <HowToPlayModal />
    </div>
  );
}
