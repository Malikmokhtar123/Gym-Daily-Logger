# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm install` — install dependencies
- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build
- `npm test` — run vitest tests (no server needed)
- `npm run lint` — ESLint

## Architecture
Next.js 15 App Router app. No `src/` directory — app lives at `app/`.

**Database**: SQLite via `better-sqlite3` (synchronous). Singleton in `db/database.ts` initialises the DB and creates the table on first call. API routes import `getDb()` directly — server-side only.

**Schema**: one table — `daily_log(id, date, sector, sales, customers)`. `date` is `UNIQUE TEXT` in `YYYY-MM-DD` format. `sector` is always `'gym'`.

**API routes**:
- `POST /api/log` — upserts a daily entry (INSERT OR REPLACE on `date`)
- `GET /api/summary` — returns `{ totals: {sales, customers}, series: [...] }`

**Frontend** (`app/page.tsx`): client component that fetches `/api/summary` on mount and after each form submit. Child components: `EntryForm`, `TotalsCard`, `SalesChart` (recharts).

**Tests** (`tests/api.test.ts`): vitest, exercises DB logic directly — no HTTP server required.

## Conventions
- Dates stored as `YYYY-MM-DD` ISO strings
- Sector hardcoded to `'gym'`
- API routes return 400 JSON `{ error: "..." }` on bad input
- Do not run `npm audit fix` — dependency versions are intentional
