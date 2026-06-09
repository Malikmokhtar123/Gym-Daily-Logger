// Uses Node.js 22.5+ built-in SQLite (no native compilation needed)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require("node:sqlite");
import path from "path";
import fs from "fs";

export interface DailyLog {
  id: number;
  date: string;
  sector: string;
  sales: number;
  customers: number;
}

const DB_DIR = path.join(process.cwd(), "db");
const DB_PATH = path.join(DB_DIR, "gym.db");

let db: InstanceType<typeof DatabaseSync> | null = null;

export function getDb() {
  if (!db) {
    // Ensure db directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new DatabaseSync(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS daily_log (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        date      TEXT NOT NULL UNIQUE,
        sector    TEXT NOT NULL DEFAULT 'gym',
        sales     REAL NOT NULL,
        customers INTEGER NOT NULL
      );
    `);
  }
  return db;
}
