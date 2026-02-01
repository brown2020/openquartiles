// src/components/game/WordBuilder.tsx
'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function WordBuilder() {
  const {
    tiles,
    selectedTileIds,
    lastAttemptedWord,
    lastAttemptResult,
    clearSelection,
    reorderSelectedTiles
  } = useGameStore();

  // Get selected tiles in order
  const selectedTiles = selectedTileIds.map(id => tiles.find(t => t.id === id));

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

  return (
    <div className="h-24 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {selectedTileIds.length > 0 ? (
          <motion.div
            key="tiles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Selected tiles as draggable chips */}
            <div className="flex items-center gap-1.5">
              <Reorder.Group
                axis="x"
                values={selectedTileIds}
                onReorder={reorderSelectedTiles}
                className="flex items-center gap-1.5"
              >
                {selectedTileIds.map((tileId) => {
                  const tile = tiles.find(t => t.id === tileId);
                  return (
                    <Reorder.Item
                      key={tileId}
                      value={tileId}
                      className={cn(
                        "px-3 py-2 rounded-lg font-bold text-lg",
                        "bg-gray-900 text-white",
                        "shadow-sm cursor-grab active:cursor-grabbing",
                        "select-none"
                      )}
                      whileDrag={{ scale: 1.1, zIndex: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {tile?.text || ''}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {/* Empty slots to show max 4 */}
              {Array.from({ length: Math.max(0, 4 - selectedTileIds.length) }).map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "w-12 h-12 rounded-lg",
                    "border-2 border-dashed border-gray-200",
                    "bg-gray-50"
                  )}
                />
              ))}
            </div>

            {/* Tile count indicator and actions */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                selectedTileIds.length === 4
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600"
              )}>
                {selectedTileIds.length} tile{selectedTileIds.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-400">drag to reorder</span>
              <button
                onClick={clearSelection}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            </div>
          </motion.div>
        ) : resultMessage ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold",
              resultMessage.bg,
              resultMessage.color
            )}
          >
            {resultMessage.text}
            {lastAttemptResult === 'correct' && ' ✓'}
            {lastAttemptResult === 'incorrect' && ' ✗'}
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            {/* Empty placeholder slots */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className={cn(
                  "w-12 h-12 rounded-lg",
                  "border-2 border-dashed border-gray-200",
                  "bg-gray-50"
                )}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
