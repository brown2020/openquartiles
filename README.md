# OpenQuartiles

A Quartiles-style word puzzle. Combine letter tiles into words, find all five four-tile Quartiles, and climb from Beginner toward Genius. Play the shared daily board or generate a custom theme. Live demo: [openquartiles.vercel.app](https://openquartiles.vercel.app/).

## Features

- Daily puzzle: one board per UTC date, cached for 24 hours
- Custom theme or a random theme from the built-in list
- Tile selection (up to 4), reorder, shuffle, hints, and submit
- Shorter words score points; Quartiles score more and remove their tiles
- Ranks from Beginner through Genius, with a +40 bonus for all five Quartiles
- Welcome screen, how-to-play dialog, found-words list, and game-complete dialog
- Stats (streak, best score, games) in `localStorage` under `quartiles-storage`
- Server actions for generation, grading, and hints. Solution words stay in a sealed `answerToken`
- OpenAI (`gpt-4.1` via `@ai-sdk/openai`) when `OPENAI_API_KEY` is set; otherwise a local fallback board
- Theme allowlist on the server (`sanitizeTheme`)
- Security headers (CSP, frame denial, nosniff, referrer policy, HSTS)
- Static About page at `/about`

## Tech stack

| Area | Choice | Version (`package.json`) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.4.3 |
| UI | React | ^19.3.1 |
| Language | TypeScript | ^6.0.3 |
| Styling | Tailwind CSS + animate plugin | ^4.3.3 |
| UI primitives | Radix Slot/Toast, CVA, Lucide | Lucide ^1.63.0 |
| State | Zustand | ^5.0.16 |
| AI | Vercel AI SDK + `@ai-sdk/openai` | ai ^7.0.156, `@ai-sdk/openai` ^4.0.104 |
| Validation helper | Zod | ^4.6.7 |
| Lint / test | ESLint ^10.13.0, Node test runner + `tsx` ^4.23.15 | — |

No Firebase, Stripe, or `NEXT_PUBLIC_` secrets. Model id stays `gpt-4.1`.

## Project structure

```
src/
  app/
    page.tsx              # Game
    about/page.tsx
    layout.tsx
  components/game/        # Board, tiles, scoring, dialogs
  components/ui/          # Toast primitives
  stores/gameStore.ts
  hooks/
  lib/
    actions.ts            # "use server" generate, grade, hint
    puzzle.ts             # Split, fallback, theme rules
    puzzle-token.ts       # Seal and grade answer tokens
    rate-limit.ts
    types.ts
    *.test.ts
spec.md
roadmap.md
.env.example
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI)
- npm

### Clone and install

```bash
git clone https://github.com/brown2020/openquartiles.git
cd openquartiles
git checkout dev
npm install
```

### Environment variables

Names only. Put values in `.env.local` (gitignored). Never commit them.

| Name | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Server-only key for themed puzzle generation. Missing or empty → local fallback board. |
| `PUZZLE_TOKEN_SECRET` | No | Server-only key (at least 16 characters) that seals solution words. Missing → built-in development key; the game still plays. |

`.env.example`:

```bash
OPENAI_API_KEY=
PUZZLE_TOKEN_SECRET=
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build (succeeds with both env vars unset) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node tests via `tsx` |
| `npm run doctor` | Optional `react-doctor` scan |

## Testing and CI

Tests live next to the modules they cover (`src/**/*.test.ts`): puzzle rules, answer tokens, rate limits, daily cache dedupe, streaks, stats sanitizing, security headers, route checks, and guess feedback.

CI (`.github/workflows/ci.yml`) on `dev` and `main`: `npm ci --ignore-scripts`, lint, typecheck, test, then `npm run build` with no secrets. Node 22.

## Deployment

Standard Next.js deploy. The demo is [openquartiles.vercel.app](https://openquartiles.vercel.app/). Set `OPENAI_API_KEY` on the host for AI boards, and set `PUZZLE_TOKEN_SECRET` so production tokens are not sealed with the built-in development key.

## Contributing

1. Branch from `dev`.
2. Run lint, typecheck, tests, and a production build before opening a PR.
3. Keep secrets server-only. Do not add `NEXT_PUBLIC_` secrets or change the model id.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
