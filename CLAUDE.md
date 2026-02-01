# CLAUDE.md - OpenQuartiles

## Project Overview

OpenQuartiles is an AI-powered word puzzle game inspired by the Quartiles game in Apple News+. Players reconstruct themed words by selecting tile chunks displayed on a board. Each puzzle features 5 themed words (8-12 letters each) split into 4-letter chunks that players must find and combine.

**Live Demo**: https://openquartiles.vercel.app/

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **UI**: React 19, TypeScript 5
- **State Management**: Zustand 5 with localStorage persistence
- **Styling**: Tailwind CSS 4, shadcn/ui, Radix UI primitives
- **Animations**: Framer Motion 12
- **AI**: OpenAI GPT-4 via Vercel AI SDK

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main game page
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Global styles
├── components/
│   ├── game/              # Game components
│   │   ├── GameArea.tsx   # Main container, puzzle generation
│   │   ├── GameBoard.tsx  # Tile grid display
│   │   ├── WordBuilder.tsx# Current word display
│   │   ├── Tile.tsx       # Individual tile with animations
│   │   ├── ActionButtons.tsx # Submit, Clear, Shuffle, Hint
│   │   ├── ScoreDisplay.tsx  # Score, rank, progress
│   │   ├── FoundWordsList.tsx # Words grouped by tile count
│   │   └── GameComplete.tsx  # Victory modal
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── actions.ts         # Server actions (AI puzzle generation)
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions (cn helper)
├── stores/
│   └── gameStore.ts       # Zustand store (game state, persistence)
└── hooks/
    └── use-toast.ts       # Toast notification hook
```

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Create `.env.local` with:
```
OPENAI_API_KEY=sk-...
```

## Key Files

- `src/lib/actions.ts` - Server action for AI puzzle generation with `generatePuzzle(theme?)`, includes `smartSplitWord()` algorithm and `COMMON_WORDS` validation set
- `src/stores/gameStore.ts` - Zustand store with game state, tile selection, word validation, scoring, and stats persistence
- `src/lib/types.ts` - Type definitions for Tile, ValidWord, Puzzle, GameState, Rank system

## Game Mechanics

**Scoring**:
- 2 tiles = 2 points
- 3 tiles = 4 points
- 4 tiles (Quartile) = 8 points
- All 5 Quartiles = +40 bonus

**Ranks**: Beginner (0) → Novice (25) → Skilled (50) → Expert (75) → Master (100) → Genius (100+ with 5/5 quartiles)

**Keyboard Shortcuts**:
- `Enter` - Submit word
- `Escape` - Clear selection
- `Space` - Shuffle tiles
- `Backspace` - Undo last tile

## Architecture Patterns

- **Server Actions**: `generatePuzzle()` runs server-side for API security
- **Client Components**: All game components use `'use client'` directive
- **State Pattern**: Zustand store with persistence middleware
- **Animation**: Framer Motion spring physics, AnimatePresence for transitions

## Conventions

- Use `cn()` utility for Tailwind class merging
- Follow mobile-first responsive design with `sm:` breakpoints
- Orange-Rose-Amber color palette for consistent theming
- Strong TypeScript typing for all state and props

## License

GNU Affero General Public License v3.0
