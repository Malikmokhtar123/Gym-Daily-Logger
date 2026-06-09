// Uses Node.js 22.5+ built-in SQLite (no native compilation needed)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require("node:sqlite");
import path from "path";
import fs from "fs";

export interface Project {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Metric {
  id: number;
  project_id: number;
  name: string;
  unit: string;
  type: "number" | "currency" | "integer";
  color: string;
}

export interface LogEntry {
  id: number;
  project_id: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface MetricValue {
  id: number;
  entry_id: number;
  metric_id: number;
  value: number;
}

const DB_DIR = path.join(process.cwd(), "db");
const DB_PATH = path.join(DB_DIR, "tracker.db");

let db: InstanceType<typeof DatabaseSync> | null = null;

export function getDb() {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new DatabaseSync(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        icon       TEXT NOT NULL DEFAULT '📊',
        color      TEXT NOT NULL DEFAULT '#6366f1',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name       TEXT NOT NULL,
        unit       TEXT NOT NULL DEFAULT '',
        type       TEXT NOT NULL DEFAULT 'number',
        color      TEXT NOT NULL DEFAULT '#6366f1'
      );

      CREATE TABLE IF NOT EXISTS log_entries (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        date       TEXT NOT NULL,
        note       TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(project_id, date)
      );

      CREATE TABLE IF NOT EXISTS metric_values (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id  INTEGER NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
        metric_id INTEGER NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
        value     REAL NOT NULL,
        UNIQUE(entry_id, metric_id)
      );
    `);
  }
  return db;
}
