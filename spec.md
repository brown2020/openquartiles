# OpenQuartiles spec

What the app does as built on `dev`. This is the behavior contract, not a wishlist.

## Product

OpenQuartiles is a single-player word puzzle in the browser. There are no accounts. A puzzle is five English words of 8–12 letters, each split into four chunks of at least two letters. Those chunks are shuffled into a tile grid. The player combines one to four tiles per guess.

Routes:

- `/` — game (client UI, server actions for generation and grading)
- `/about` — static explanation

## Play

1. **Daily Puzzle** loads one shared board for the current UTC date. The theme is chosen from a fixed list by a hash of that date. The visible label is `Daily: <theme>`. The stored theme is the raw word so "new puzzle" can regenerate it.
2. **Custom theme** accepts letters, numbers, spaces, hyphens, and apostrophes, trimmed to 64 characters. Anything else is rejected. An empty theme picks a random list theme.
3. Select up to four unused tiles. Only the last selected tile can be deselected by clicking it. Arrow buttons reorder the selection. Shuffle randomizes unused tiles and clears the selection.
4. Submit checks the concatenated tile text. A repeat of a word already found shows "Already found". A miss shows the guess with a failure mark. A hit scores points. Four-tile Quartiles mark their tiles used; shorter words do not.
5. The game is complete when five Quartiles are found. Escape dismisses the victory dialog. Board shortcuts do nothing while the how-to-play dialog or the victory dialog is open.

Keyboard, when no dialog is open and focus is not in a field:

| Key | Action |
| --- | --- |
| Enter | Submit |
| Escape | Clear selection |
| Backspace | Undo last tile |
| Space | Shuffle |

## Scoring and ranks

| Tiles | Points |
| --- | --- |
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 (Quartile) | 8 |
| All 5 Quartiles | +40 |

Points come from the sealed answer, not from the number of tiles the client claims.

| Rank | Rule |
| --- | --- |
| Beginner | score under 25 |
| Novice | 25–49 |
| Skilled | 50–74 |
| Expert | 75–99 |
| Master | 100 or more, fewer than 5 Quartiles or score under the Genius rule |
| Genius | 5 Quartiles and score at least 100 |

Finding only the five Quartiles scores 80 and is Expert. The victory heading uses this rank.

A hint returns the first four letters of one unfound Quartile plus `...`. Hints do not change the score.

## Words

- AI output is normalized to at most five distinct A–Z words of length 8–12, each split into exactly four chunks.
- Shorter valid words are adjacent chunks, or any two tiles, that appear in the built-in common-word list.
- If the model fails, times out, or the key is missing, the fallback words are ADVENTURE, DISCOVERY, BEAUTIFUL, WONDERFUL, and FANTASTIC.
- Generation makes at most two model calls. Each call disables SDK retries, caps output at 500 tokens, and times out after 10 seconds. The page `maxDuration` is 30 seconds. The model id is `gpt-4.1`.

## Server contract

Server actions in `src/lib/actions.ts`:

| Action | Behavior |
| --- | --- |
| `generatePuzzle` | Rate limit, then build and seal a board. |
| `generateDailyPuzzle` | Return the cached board for today's UTC date, building it once on a miss. |
| `gradeWord` | Rate limit, then score the guess from the sealed token. |
| `revealHint` | Rate limit, then return a four-letter prefix. |

Limits are in-process sliding windows:

- Puzzle generation: 8 per 10 minutes per caller address
- Grading: 60 per minute
- Hints: 20 per minute

Over-limit generation throws a wait message. Over-limit grading or hints return a limited result and the UI shows an error.

The client puzzle is `id`, `date`, `tiles`, `maxScore`, `theme`, and `answerToken`. It does not include `validWords` or `quartiles`. The token is AES-256-GCM. `PUZZLE_TOKEN_SECRET` (at least 16 characters) is the key material. When it is unset, a built-in development key is used.

Caller address is the first `X-Forwarded-For` hop, else `X-Real-IP`, else a shared `unknown` bucket.

There are no `/api` route handlers. Stats are not written to a server.

## Persistence

Zustand persist stores only `stats` in `localStorage` (`quartiles-storage`). On load, stats are sanitized: non-negative integers, a `YYYY-MM-DD` last-played date or null, and a rank history of at most 100 known rank names. A broken blob becomes the default stats.

Streaks count one completed game per UTC day. A win on the next UTC day increments the streak. A gap resets it to 1. A second win the same day does not increment it. `gamesPlayed` and `gamesCompleted` still increment on every completion.

## Security headers

Every route sends:

- Content-Security-Policy (self, inline styles/scripts for Next, Google Fonts stylesheet and font files)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security
- Permissions-Policy denying camera, microphone, and geolocation

## Environment

| Name | Required |
| --- | --- |
| `OPENAI_API_KEY` | No. Missing → fallback board. Read only when a puzzle is generated. |
| `PUZZLE_TOKEN_SECRET` | No. Missing → built-in development key. |

The production build does not need either variable.

## Out of scope

No accounts, leaderboards, Firestore, Storage, Stripe, or webhooks. Scores on one browser are not shared with anyone else.
