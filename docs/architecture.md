# Architecture

## Map

```
Browser
  └─ Next.js App Router
       ├─ / (page.tsx → GameArea client)
       │    ├─ WelcomeScreen / ActiveGame
       │    ├─ GameBoard, WordBuilder, ActionButtons, ScoreDisplay
       │    ├─ Zustand gameStore (stats → localStorage)
       │    └─ server actions: generatePuzzle / generateDailyPuzzle / gradeWord
       │         └─ OpenAI via @ai-sdk/openai (deferred; fallback if no key)
       │         └─ answer token (AES-GCM); solution words stay server-side
       └─ /about (Server Component, static)
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_daily / start_custom | tiles, sealed answer token | `generatePuzzle` / `generateDailyPuzzle` → `initializePuzzle` | daily board cached per UTC date; AI on server |
| select_tile / submit_word | selectedTileIds, foundWords, score | `gradeWord` then gameStore | in-memory; points come from the sealed key |
| complete_puzzle | stats (streak, best) | gameStore partialize | localStorage `quartiles-storage` |
| persist_stats | GameStats | zustand persist | localStorage only |

No server-side score store. Reload restores stats only.

## Server / client

- **Server:** `src/lib/actions.ts` (`"use server"`). Theme sanitized via `sanitizeTheme`. OpenAI client created only when `OPENAI_API_KEY` is set. Guesses are graded with `gradeWord` against the sealed key.
- **Client:** all interactive UI under `src/components/game/*` and `gameStore`. The client puzzle has tiles and `answerToken`, not `validWords`.
- **Secrets:** `OPENAI_API_KEY` and `PUZZLE_TOKEN_SECRET` stay server-only. No `NEXT_PUBLIC_*` secrets. A missing puzzle secret falls back to a built-in development key.
- **Denied mutations:** no `/api/*` route handlers; POST to `/api/scores` (etc.) returns Next 404.

## Change exercises

1. **Data / provider:** change `SCORING.FOUR_TILES` in `types.ts` or `pointsForTileCount` in `puzzle.ts` — store submit + unit tests update; UI labels in HowToPlay.
2. **Access:** rejecting invalid themes in `sanitizeTheme` / `generatePuzzle`; adding a future `/api/scores` would need a new route + auth. Today: absent routes + 404 prove no privileged write surface.
