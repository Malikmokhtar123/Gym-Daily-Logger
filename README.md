# Gym Daily Logger

A full-stack daily logging app for a gym — log each day's total sales revenue and customer count, then view running totals and a time-series chart on the dashboard.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), fill in a date, sales figure, and customer count, then hit **Save Entry**. The dashboard updates instantly with running totals and a chart.

Data is stored in SQLite (`db/gym.db`) and survives restarts.

## Run tests

```bash
npm test
```

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- SQLite via `better-sqlite3`
- Recharts for the dashboard chart
- Vitest for tests
