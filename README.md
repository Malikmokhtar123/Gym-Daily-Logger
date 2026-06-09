# Gym Daily Logger

A full-stack daily logging app for a gym — log each day's total sales revenue and customer count, then view running totals and a time-series chart on the dashboard. Built as a multi-project daily tracker where each project has custom metrics, streak tracking, and rich charts, with the gym sector as the default flavor.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a project, define your metrics, then log daily entries. The dashboard updates instantly with running totals, streak count, and a chart over time.

Data is stored in SQLite (`db/tracker.db`) and survives restarts.

## Run tests

```bash
npm test
```

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- Node.js built-in SQLite (`node:sqlite`)
- Recharts for the dashboard chart
- Vitest for tests

## Live

https://orange-water-09fd10e10.7.azurestaticapps.net
