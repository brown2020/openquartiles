# AGENTS

## Commands

```bash
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment

- `OPENAI_API_KEY` — server-only, optional. Missing key → local fallback puzzle.
- Never inline keys in `.github/workflows/*`; use `${{ secrets.OPENAI_API_KEY }}` on the build step only when needed.
- CI gate jobs tolerate missing secrets.

## Architecture

See `docs/architecture.md`. Auth UX is N/A (no email/password surfaces).
