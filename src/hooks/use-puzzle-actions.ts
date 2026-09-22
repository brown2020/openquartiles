'use client';

import { useCallback, useTransition } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { generatePuzzle, generateDailyPuzzle } from '@/lib/actions';

export function usePuzzleActions() {
  const {
    puzzle,
    inputTheme,
    initializePuzzle,
    setLoading,
    setError,
  } = useGameStore();
  const [isPending, startTransition] = useTransition();

  const handleGeneratePuzzle = useCallback(
    async (theme?: string) => {
      setLoading(true);
      setError(null);
      try {
        const newPuzzle = await generatePuzzle(theme || undefined);
        initializePuzzle(newPuzzle);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate puzzle';
        setError(message);
      }
    },
    [initializePuzzle, setLoading, setError]
  );

  const handleDailyPuzzle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newPuzzle = await generateDailyPuzzle();
      initializePuzzle(newPuzzle);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate daily puzzle';
      setError(message);
    }
  }, [initializePuzzle, setLoading, setError]);

  const startCustom = () => {
    startTransition(() => {
      void handleGeneratePuzzle(inputTheme || undefined);
    });
  };

  const startDaily = () => {
    startTransition(() => {
      void handleDailyPuzzle();
    });
  };

  const startNewSameTheme = () => {
    startTransition(() => {
      void handleGeneratePuzzle(puzzle?.theme);
    });
  };

  return {
    isPending,
    startCustom,
    startDaily,
    startNewSameTheme,
  };
}
