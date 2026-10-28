# OpenQuartiles roadmap

Punchlist after the maintenance pass on `dev`. No open GitHub issues or pull requests were listed at the time of this file.

## Next steps

1. Set `PUZZLE_TOKEN_SECRET` on the host (at least 16 characters) so production answer tokens are not sealed with the built-in development key. Set `OPENAI_API_KEY` there if themed AI boards should replace the fallback. Do not commit either value.
2. Promote `dev` to `main` only after QA. This pass does not promote.
3. Confirm the live daily board is the same for two browsers on the same UTC date (Next data cache plus the in-process single-flight).
4. Move rate limits off the process map so a second serverless instance cannot reset the budget. A shared store (Vercel KV or similar) is the follow-up. Do not add it until a store is chosen.
5. Upgrade TypeScript to 7.0.2 when `typescript-eslint` accepts it. The latest stable `typescript-eslint` (8.72.1) peers `typescript` `<6.1.0`, so 7.0.2 is not feasible yet. Stay on TypeScript 6.0.3.
6. Replace the Google Fonts `<link>` in `src/app/layout.tsx` with a working `next/font` setup so the `no-page-custom-font` ESLint warning goes away. An earlier Turbopack font attempt was reverted; retry only when that path builds.
7. Either use Zod on the model JSON or drop the unused `zod` dependency. The toast hook is also unused by the game.
8. Correct the how-to-play goal sentence. It says finding five Quartiles reaches Expert. Genius still requires five Quartiles and a score of at least 100. Five Quartiles alone score 80 (Expert).

## Known limitations

- Rate limits and the daily single-flight map live in memory. They do not span isolates. The daily board is also stored with `unstable_cache` for 24 hours, which is what makes it shared on Vercel.
- With `PUZZLE_TOKEN_SECRET` unset, anyone with the server source can open answer tokens. The browser still does not receive plaintext solution words.
- Stats and the victory streak are local to the browser. Editing `localStorage` changes them. There is no server leaderboard.
- Custom themes are allowlisted, then interpolated into the model prompt. That is how themed boards work. The allowlist blocks quotes and newlines; it does not block ordinary sentences.
- Hints are free apart from the per-minute cap. They reveal a four-letter prefix.
- A failed model day can cache the fallback board until the 24-hour revalidate.
- `semver` is only a transitive install. The hoisted copy moved from 7.x to 6.x in this lockfile refresh because a dependency range asked for 6. App code does not import it. Lint, tests, and the production build passed after the refresh.

## Open issues

None on GitHub. File new bugs against `dev` rather than patching `main` directly.
