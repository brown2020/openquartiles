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
      whileHover={!isUsed && !isSelected ? { scale: 1.05 } : {}}
      whileTap={!isUsed ? { scale: 0.95 } : {}}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 25,
        layout: { duration: 0.3 }
      }}
      onClick={onClick}
      disabled={isUsed}
      className={cn(
        'relative w-full aspect-square rounded-xl font-bold text-lg sm:text-xl',
        'flex items-center justify-center',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'select-none cursor-pointer',
        // Default state - cream/warm white tiles
        !isSelected && !isUsed && [
          'bg-gradient-to-br from-amber-50 to-orange-50',
          'border-2 border-amber-200/80',
          'text-amber-900',
          'shadow-md hover:shadow-lg',
          'focus-visible:ring-amber-400',
        ],
        // Selected state - vibrant coral/orange
        isSelected && [
          'bg-gradient-to-br from-orange-400 to-rose-500',
          'border-2 border-orange-300',
          'text-white',
          'shadow-lg shadow-orange-400/30',
          'focus-visible:ring-orange-400',
        ],
        // Used state - faded
        isUsed && [
          'bg-gray-100',
          'border-2 border-gray-200',
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
            'bg-white text-orange-500 text-xs font-bold',
            'flex items-center justify-center',
            'shadow-sm border border-orange-200',
          )}
        >
          {selectionIndex + 1}
        </motion.span>
      )}

      {/* Shine effect for selected tiles */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: [0, 0.5, 0], x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl"
        />
      )}
    </motion.button>
  );
}



