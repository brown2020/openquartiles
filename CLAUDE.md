# CLAUDE.md - OpenQuartiles

## Project Overview

OpenQuartiles is an AI-powered word puzzle game inspired by the Quartiles game in Apple News+. Players reconstruct themed words by selecting tile chunks displayed on a board. Each puzzle features 5 themed words (8-12 letters each) split into chunks that players must find and combine.

**Live Demo**: https://openquartiles.vercel.app/

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **UI**: React 19, TypeScript 5
- **State Management**: Zustand 5 with localStorage persistence
- **Styling**: Tailwind CSS 4, shadcn/ui, Radix UI primitives
- **Animations**: Framer Motion 12 (including Reorder for drag-to-reorder)
- **AI**: OpenAI GPT-4 via Vercel AI SDK

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main game page (clean gray background)
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Global styles
├── components/
│   ├── game/              # Game components
│   │   ├── GameArea.tsx   # Main container, daily + custom puzzles
│   │   ├── GameBoard.tsx  # Tile grid (tiles first, quartiles below)
│   │   ├── WordBuilder.tsx# Visual tile chips with drag-to-reorder
│   │   ├── Tile.tsx       # Clean white/dark tile style
│   │   ├── ActionButtons.tsx # Submit, Clear, Shuffle, Hint
│   │   ├── ScoreDisplay.tsx  # Simplified score + progress bar
│   │   ├── FoundWordsList.tsx # Collapsible word groups
│   │   └── GameComplete.tsx  # Victory modal
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── actions.ts         # Server actions (generatePuzzle, generateDailyPuzzle)
│   ├── types.ts           # TypeScript types + scoring constants
│   └── utils.ts           # Utility functions (cn helper)
├── stores/
│   └── gameStore.ts       # Zustand store with reorderSelectedTiles
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

- `src/lib/actions.ts` - Server actions for puzzle generation
  - `generatePuzzle(theme?)` - Custom theme puzzle
  - `generateDailyPuzzle()` - Same puzzle for everyone each day
  - `smartSplitWord()` - Splits words into 2-4 letter chunks
  - `COMMON_WORDS` - Validation set for shorter words

- `src/stores/gameStore.ts` - Zustand store
  - Tile selection with max 4 tiles
  - `reorderSelectedTiles()` - For drag-to-reorder
  - Word validation and scoring
  - Stats persistence to localStorage

- `src/lib/types.ts` - Type definitions
  - `SCORING` constants (1/2/4/8 points + 40 bonus)
  - Tile, ValidWord, Puzzle, GameState, Rank types

## Game Mechanics

**Scoring** (Apple Quartiles style):
- 1 tile = 1 point
- 2 tiles = 2 points
- 3 tiles = 4 points
- 4 tiles (Quartile) = 8 points
- All 5 Quartiles = +40 bonus

**Ranks**: Beginner (0) → Novice (25) → Skilled (50) → Expert (75) → Master (100) → Genius (100+ with 5/5 quartiles)

**Features**:
- Daily puzzle mode (same for everyone each day)
- Custom theme puzzles
- Drag-to-reorder selected tiles
- Found quartiles appear at bottom of grid
- Collapsible "Words Found" section

**Keyboard Shortcuts**:
- `Enter` - Submit word
- `Escape` - Clear selection
- `Space` - Shuffle tiles
- `Backspace` - Undo last tile

## Visual Design

Clean, minimal Apple-inspired design:
- **Background**: Light gray (`bg-gray-50`)
- **Tiles**: White unselected, dark gray selected
- **Found Quartiles**: Green accent at bottom
- **Typography**: Clean sans-serif, no emojis in UI

## Architecture Patterns

- **Server Actions**: `generatePuzzle()` and `generateDailyPuzzle()` run server-side
- **Client Components**: All game components use `'use client'` directive
- **State Pattern**: Zustand store with persistence middleware
- **Animation**: Framer Motion spring physics, Reorder for drag-drop

## Conventions

- Use `cn()` utility for Tailwind class merging
- Follow mobile-first responsive design
- Gray color palette (gray-50 to gray-900)
- Strong TypeScript typing for all state and props

## License

GNU Affero General Public License v3.0
