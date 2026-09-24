# OpenQuartiles

A Quartiles-style word puzzle: combine letter tiles to form words, find all five four-tile “Quartiles,” and climb ranks from Beginner toward Genius. Play a daily themed puzzle or generate a custom theme. Live demo: [openquartiles.vercel.app](https://openquartiles.vercel.app/).

## Features

Verified from the current codebase:

- Daily puzzle (theme seeded by UTC date) and custom/random theme play
- Tile selection, word builder, shuffle, hints, scoring, and rank calculation
- Quartiles (4-tile solutions) plus shorter valid combinations against a common-word list
- Welcome screen, how-to-play modal, found-words list, game-complete view
- Stats persistence (streaks, best score, games played) via Zustand `persist` → `localStorage`
- Server actions `generatePuzzle` / `generateDailyPuzzle` using OpenAI (`gpt-4.1`) when `OPENAI_API_KEY` is set; otherwise a local fallback puzzle
- Theme sanitization on the server (`sanitizeTheme`)
- Static About page at `/about`

## Tech stack

| Area | Choice | Version (package.json) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.3.6 |
| UI | React | ^19.3.0 |
| Language | TypeScript | ^6 |
| Styling | Tailwind CSS + animate plugin | ^4.3.3 |
| UI primitives | Radix Slot/Toast, CVA, Lucide | — |
| State | Zustand | ^5.0.15 |
| AI | Vercel AI SDK + `@ai-sdk/openai` | ai ^6.0.288 |
| Validation / helpers | Zod | ^4.6.5 |
| Lint / test | ESLint 10, Node test runner + `tsx` | — |

No Firebase, Stripe, or client-exposed API keys.

## Project structure

```
src/
  app/
    page.tsx              # GameArea
    about/page.tsx
    layout.tsx
  components/game/        # Welcome, board, tiles, scoring, modals, …
  components/ui/          # Toast
  stores/gameStore.ts
  hooks/
  lib/
    actions.ts            # "use server" puzzle generation
    puzzle.ts             # Pure helpers + fallback
    types.ts
    *.test.ts
docs/
.env.example
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI) or a current LTS
- npm
- OpenAI API key (optional; fallback puzzles work without it)

### Clone and install

```bash
git clone https://github.com/brown2020/openquartiles.git
cd openquartiles
npm install
```

### Environment variables

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server-only key for AI puzzle generation. Optional; missing key → `getFallbackPuzzle`. | [OpenAI API keys](https://platform.openai.com/api-keys) |

`.env.example`:

```bash
OPENAI_API_KEY=
```

Put real values only in `.env.local` (gitignored). Never commit keys.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node tests via `tsx` |
| `npm run doctor` | Optional `react-doctor` scan |

## Testing and CI

- Tests: `src/lib/puzzle.test.ts`, `src/lib/routes.test.ts`.
- CI: install with `--ignore-scripts`, lint, typecheck, test, then build with optional `OPENAI_API_KEY` from Actions secrets (Node 22). Build tolerates a missing key via deferred OpenAI init + fallback puzzle.

## Deployment

Standard Next.js deploy (demo: [openquartiles.vercel.app](https://openquartiles.vercel.app/). Set `OPENAI_API_KEY` in the host environment for AI-generated puzzles.

## Contributing

1. Branch from `dev`.
2. Run lint, typecheck, and tests before opening a PR.
3. Keep `OPENAI_API_KEY` server-only; do not add `NEXT_PUBLIC_*` secrets.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
