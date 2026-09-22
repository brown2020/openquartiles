'use client';

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { usePuzzleActions } from '@/hooks/use-puzzle-actions';
import { WelcomeScreen } from './WelcomeScreen';
import { ActiveGame } from './ActiveGame';

export default function GameArea() {
  const {
    puzzle,
    isLoading,
    submitWord,
    clearSelection,
    shuffleTiles,
    selectedTileIds,
    deselectTile,
  } = useGameStore();

  const { isPending, startCustom, startDaily, startNewSameTheme } =
    usePuzzleActions();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const inField = tag === 'input' || tag === 'textarea' || target?.isContentEditable;

      if (e.key === 'Enter' && !inField) {
        e.preventDefault();
        submitWord();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
      } else if (e.key === ' ' && !inField) {
        e.preventDefault();
        shuffleTiles();
      } else if (e.key === 'Backspace' && !inField) {
        e.preventDefault();
        const lastId = selectedTileIds[selectedTileIds.length - 1];
        if (lastId) deselectTile(lastId);
      }
    },
    [submitWord, clearSelection, shuffleTiles, selectedTileIds, deselectTile]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const loading = isLoading || isPending;

  const onStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    startCustom();
  };

  if (!puzzle) {
    return (
      <WelcomeScreen
        loading={loading}
        onStartDaily={startDaily}
        onStartCustom={onStartCustom}
      />
    );
  }

  return <ActiveGame loading={loading} onNewGame={startNewSameTheme} />;
}
