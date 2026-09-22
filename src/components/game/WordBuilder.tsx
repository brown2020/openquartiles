'use client';

import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function WordBuilder() {
  const {
    tiles,
    selectedTileIds,
    lastAttemptedWord,
    lastAttemptResult,
    clearSelection,
    reorderSelectedTiles,
  } = useGameStore();

  const tileById = new Map(tiles.map((t) => [t.id, t]));

  const getResultMessage = () => {
    if (!lastAttemptResult) return null;
    switch (lastAttemptResult) {
      case 'correct':
        return { text: `${lastAttemptedWord}`, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'incorrect':
        return { text: `${lastAttemptedWord}`, color: 'text-rose-600', bg: 'bg-rose-50' };
      case 'already-found':
        return { text: 'Already found', color: 'text-amber-600', bg: 'bg-amber-50' };
    }
  };

  const resultMessage = getResultMessage();

  const moveChip = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= selectedTileIds.length) return;
    const order = [...selectedTileIds];
    const tmp = order[index];
    order[index] = order[next];
    order[next] = tmp;
    reorderSelectedTiles(order);
  };

  return (
    <div className="h-24 flex flex-col items-center justify-center" aria-live="polite">
      {selectedTileIds.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <ul className="flex items-center gap-1.5 list-none m-0 p-0" aria-label="Selected tiles">
            {selectedTileIds.map((tileId, index) => {
              const tile = tileById.get(tileId);
              return (
                <li key={tileId} className="flex flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      'px-3 py-2 rounded-lg font-bold text-lg',
                      'bg-gray-900 text-white shadow-sm select-none'
                    )}
                  >
                    {tile?.text || ''}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveChip(index, -1)}
                      disabled={index === 0}
                      className="text-[10px] px-1 text-gray-500 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded"
                      aria-label={`Move ${tile?.text || 'tile'} left`}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => moveChip(index, 1)}
                      disabled={index === selectedTileIds.length - 1}
                      className="text-[10px] px-1 text-gray-500 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 rounded"
                      aria-label={`Move ${tile?.text || 'tile'} right`}
                    >
                      ▶
                    </button>
                  </div>
                </li>
              );
            })}
            {Array.from({ length: Math.max(0, 4 - selectedTileIds.length) }).map((_, index) => (
              <li
                key={`empty-${index}`}
                className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50"
                aria-hidden
              />
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                selectedTileIds.length === 4
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {selectedTileIds.length} tile{selectedTileIds.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">use arrows to reorder</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-gray-400 hover:text-gray-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      ) : resultMessage ? (
        <div
          className={cn(
            'px-4 py-2 rounded-lg font-semibold',
            resultMessage.bg,
            resultMessage.color
          )}
        >
          {resultMessage.text}
          {lastAttemptResult === 'correct' && ' ✓'}
          {lastAttemptResult === 'incorrect' && ' ✗'}
        </div>
      ) : (
        <div className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      )}
    </div>
  );
}
