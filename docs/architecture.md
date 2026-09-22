# Architecture

## Map

```
Browser
  └─ Next.js App Router
       ├─ / (page.tsx → GameArea client)
       │    ├─ WelcomeScreen / ActiveGame
       │    ├─ GameBoard, WordBuilder, ActionButtons, ScoreDisplay
       │    ├─ Zustand gameStore (stats → localStorage)
       │    └─ server actions: generatePuzzle / generateDailyPuzzle
       │         └─ OpenAI via @ai-sdk/openai (deferred; fallback if no key)
       └─ /about (Server Component, static)
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_daily / start_custom | puzzle, tiles | `generatePuzzle` / `generateDailyPuzzle` → `initializePuzzle` | puzzle in-memory; AI on server |
| select_tile / submit_word | selectedTileIds, foundWords, score | gameStore | in-memory |
| complete_puzzle | stats (streak, best) | gameStore partialize | localStorage `quartiles-storage` |
| persist_stats | GameStats | zustand persist | localStorage only |

No server-side score store. Reload restores stats only.

## Server / client

- **Server:** `src/lib/actions.ts` (`"use server"`). Theme sanitized via `sanitizeTheme`. OpenAI client created only when `OPENAI_API_KEY` is set.
- **Client:** all interactive UI under `src/components/game/*` and `gameStore`.
- **Secrets:** `OPENAI_API_KEY` stays server-only. No `NEXT_PUBLIC_*` secrets.
- **Denied mutations:** no `/api/*` route handlers; POST to `/api/scores` (etc.) returns Next 404.

## Change exercises

1. **Data / provider:** change `SCORING.FOUR_TILES` in `types.ts` or `pointsForTileCount` in `puzzle.ts` — store submit + unit tests update; UI labels in HowToPlay.
2. **Access:** rejecting invalid themes in `sanitizeTheme` / `generatePuzzle`; adding a future `/api/scores` would need a new route + auth. Today: absent routes + 404 prove no privileged write surface.
