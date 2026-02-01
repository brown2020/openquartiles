// src/components/game/GameBoard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tile } from './Tile';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function GameBoard() {
  const { tiles, selectedTileIds, selectTile, deselectTile, foundWords, puzzle } = useGameStore();
  
  // Filter to only show available (not used) tiles
  const availableTiles = tiles.filter(t => !t.isUsed);
  
  // Get found quartiles with their chunks
  const foundQuartiles = foundWords.filter(w => w.isQuartile);

  const handleTileClick = (tileId: string) => {
    if (selectedTileIds.includes(tileId)) {
      // Only deselect if it's the last selected tile
      const lastSelected = selectedTileIds[selectedTileIds.length - 1];
      if (tileId === lastSelected) {
        deselectTile(tileId);
      }
    } else {
      selectTile(tileId);
    }
  };

  // Get chunks for a found word
  const getChunksForWord = (tileIds: string[]): string[] => {
    return tileIds.map(id => {
      const tile = tiles.find(t => t.id === id);
      return tile?.text || '';
    });
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Active tiles grid - FIRST (Apple style) */}
      {availableTiles.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
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

      {/* Found Quartiles - BOTTOM (Apple style) */}
      <AnimatePresence>
        {foundQuartiles.map((word, index) => {
          const chunks = getChunksForWord(word.tileIds);

          return (
            <motion.div
              key={word.word}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.1
              }}
              className="relative"
            >
              <div className={cn(
                "grid gap-2 sm:gap-3 p-3 rounded-xl",
                "bg-emerald-50",
                "border border-emerald-200",
                "shadow-sm"
              )}
              style={{ gridTemplateColumns: `repeat(${chunks.length}, 1fr)` }}
              >
                {chunks.map((chunk, chunkIndex) => (
                  <motion.div
                    key={`${word.word}-${chunkIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + chunkIndex * 0.05 }}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center",
                      "bg-emerald-500",
                      "text-white font-bold text-sm sm:text-base",
                      "shadow-sm"
                    )}
                  >
                    {chunk}
                  </motion.div>
                ))}

                {/* Word label */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "absolute -right-2 -top-2",
                    "flex items-center gap-1 px-2 py-1",
                    "bg-emerald-500 text-white text-xs font-bold",
                    "rounded-full shadow-sm"
                  )}
                >
                  <Check className="w-3 h-3" />
                  <span>{word.word}</span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* All complete message */}
      {availableTiles.length === 0 && foundQuartiles.length === 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="text-lg font-bold text-emerald-600">All Quartiles Found!</div>
        </motion.div>
      )}
    </motion.div>
  );
}
