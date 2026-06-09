import { describe, it, expect, afterAll } from "vitest";
import { getDb } from "../db/database";

describe("Daily Tracker DB logic", () => {
  let projectId: number;
  let metricId: number;
  let entryId: number;

  afterAll(() => {
    const db = getDb();
    if (projectId) {
      db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
    }
  });

  it("creates a project and retrieves it", () => {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO projects (name, icon, color) VALUES (?, ?, ?)
    `).run("Test Gym", "🏋️", "#6366f1");

    projectId = result.lastInsertRowid as number;
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId) as { name: string; icon: string };

    expect(project).toBeTruthy();
    expect(project.name).toBe("Test Gym");
    expect(project.icon).toBe("🏋️");
  });

  it("inserts a metric and logs an entry with a value", () => {
    const db = getDb();

    const metricResult = db.prepare(`
      INSERT INTO metrics (project_id, name, unit, type, color) VALUES (?, ?, ?, ?, ?)
    `).run(projectId, "Sales", "£", "currency", "#6366f1");
    metricId = metricResult.lastInsertRowid as number;

    const entryResult = db.prepare(`
      INSERT INTO log_entries (project_id, date, note) VALUES (?, ?, ?)
    `).run(projectId, "2099-01-01", "Test entry");
    entryId = entryResult.lastInsertRowid as number;

    db.prepare(`
      INSERT INTO metric_values (entry_id, metric_id, value) VALUES (?, ?, ?)
    `).run(entryId, metricId, 1500.5);

    const value = db.prepare("SELECT * FROM metric_values WHERE entry_id = ? AND metric_id = ?").get(entryId, metricId) as { value: number };
    expect(value).toBeTruthy();
    expect(value.value).toBe(1500.5);
  });

  it("upserts an entry (same project + date updates existing)", () => {
    const db = getDb();

    db.prepare(`
      INSERT INTO log_entries (project_id, date, note)
      VALUES (?, ?, ?)
      ON CONFLICT(project_id, date) DO UPDATE SET note = excluded.note
    `).run(projectId, "2099-01-01", "Updated note");

    const entry = db.prepare("SELECT * FROM log_entries WHERE project_id = ? AND date = ?").get(projectId, "2099-01-01") as { note: string };
    expect(entry.note).toBe("Updated note");
  });

  it("returns all entries for a project ordered by date", () => {
    const db = getDb();

    db.prepare(`INSERT INTO log_entries (project_id, date) VALUES (?, ?) ON CONFLICT DO NOTHING`).run(projectId, "2099-01-02");
    db.prepare(`INSERT INTO log_entries (project_id, date) VALUES (?, ?) ON CONFLICT DO NOTHING`).run(projectId, "2099-01-03");

    const entries = db.prepare("SELECT * FROM log_entries WHERE project_id = ? ORDER BY date ASC").all(projectId) as { date: string }[];
    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(entries[0].date).toBe("2099-01-01");
  });
});
