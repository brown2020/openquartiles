'use client';

import { Tile } from './Tile';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function GameBoard() {
  const { tiles, selectedTileIds, selectTile, deselectTile, foundWords } =
    useGameStore();

  const availableTiles = tiles.filter((t) => !t.isUsed);
  const foundQuartiles = foundWords.filter((w) => w.isQuartile);
  const tileById = new Map(tiles.map((t) => [t.id, t]));

  const handleTileClick = (tileId: string) => {
    if (selectedTileIds.includes(tileId)) {
      const lastSelected = selectedTileIds[selectedTileIds.length - 1];
      if (tileId === lastSelected) {
        deselectTile(tileId);
      }
    } else {
      selectTile(tileId);
    }
  };

  const getChunksForWord = (tileIds: string[]): string[] =>
    tileIds.map((id) => tileById.get(id)?.text || '');

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {availableTiles.length > 0 && (
        <div
          className="grid grid-cols-4 gap-2 sm:gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
          role="group"
          aria-label="Available tiles"
        >
          {availableTiles.map((tile) => {
            const selectionIndex = selectedTileIds.indexOf(tile.id);
            return (
              <Tile
                key={tile.id}
                tile={tile}
                onClick={() => handleTileClick(tile.id)}
                selectionIndex={selectionIndex >= 0 ? selectionIndex : undefined}
              />
            );
          })}
        </div>
      )}

      {foundQuartiles.map((word) => {
        const chunks = getChunksForWord(word.tileIds);
        return (
          <div key={word.word} className="relative">
            <div
              className={cn(
                'grid gap-2 sm:gap-3 p-3 rounded-xl',
                'bg-emerald-50 border border-emerald-200 shadow-sm'
              )}
              style={{ gridTemplateColumns: `repeat(${chunks.length}, 1fr)` }}
            >
              {chunks.map((chunk, chunkIndex) => (
                <div
                  key={`${word.word}-chunk-${chunk}-${chunkIndex}`}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center',
                    'bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-sm'
                  )}
                >
                  {chunk}
                </div>
              ))}
              <div
                className={cn(
                  'absolute -right-2 -top-2',
                  'flex items-center gap-1 px-2 py-1',
                  'bg-emerald-500 text-white text-xs font-bold',
                  'rounded-full shadow-sm'
                )}
              >
                <Check className="w-3 h-3" aria-hidden />
                <span>{word.word}</span>
              </div>
            </div>
          </div>
        );
      })}

      {availableTiles.length === 0 && foundQuartiles.length === 5 && (
        <div className="text-center py-6">
          <div className="text-lg font-bold text-emerald-600">All Quartiles Found!</div>
        </div>
      )}
    </div>
  );
}
