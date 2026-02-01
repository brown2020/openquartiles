// src/components/game/Tile.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tile as TileType } from '@/lib/types';

interface TileProps {
  tile: TileType;
  onClick: () => void;
  selectionIndex?: number;
}

export function Tile({ tile, onClick, selectionIndex }: TileProps) {
  const isSelected = tile.isSelected;
  const isUsed = tile.isUsed;

  return (
    <motion.button
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isUsed ? 0.95 : 1,
        opacity: isUsed ? 0.3 : 1,
      }}
      whileHover={!isUsed && !isSelected ? { scale: 1.03 } : {}}
      whileTap={!isUsed ? { scale: 0.97 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        layout: { duration: 0.3 }
      }}
      onClick={onClick}
      disabled={isUsed}
      className={cn(
        'relative w-full aspect-square rounded-lg font-bold text-lg sm:text-xl',
        'flex items-center justify-center',
        'transition-colors duration-150 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'select-none cursor-pointer',
        // Default state - clean white (Apple style)
        !isSelected && !isUsed && [
          'bg-white',
          'border border-gray-200',
          'text-gray-900',
          'shadow-sm hover:shadow-md hover:border-gray-300',
          'focus-visible:ring-gray-400',
        ],
        // Selected state - dark (Apple style)
        isSelected && [
          'bg-gray-900',
          'border border-gray-900',
          'text-white',
          'shadow-md',
          'focus-visible:ring-gray-900',
        ],
        // Used state - faded
        isUsed && [
          'bg-gray-100',
          'border border-gray-200',
          'text-gray-400',
          'cursor-not-allowed',
          'shadow-none',
        ],
      )}
    >
      <span className="relative z-10">{tile.text}</span>

      {/* Selection order indicator */}
      {isSelected && selectionIndex !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full',
            'bg-white text-gray-900 text-xs font-bold',
            'flex items-center justify-center',
            'shadow-sm border border-gray-200',
          )}
        >
          {selectionIndex + 1}
        </motion.span>
      )}
    </motion.button>
  );
}
