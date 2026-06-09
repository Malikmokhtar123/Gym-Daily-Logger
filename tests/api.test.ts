import { describe, it, expect, afterAll } from "vitest";
import { getDb } from "../db/database";

describe("daily_log DB logic", () => {
  afterAll(() => {
    // Clean up test entries
    const db = getDb();
    db.prepare("DELETE FROM daily_log WHERE date LIKE '2099-%'").run();
  });

  it("inserts a valid log entry and retrieves it", () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO daily_log (date, sector, sales, customers)
      VALUES (?, 'gym', ?, ?)
      ON CONFLICT(date) DO UPDATE SET sales = excluded.sales, customers = excluded.customers
    `).run("2099-01-01", 1500.5, 75);

    const row = db.prepare("SELECT * FROM daily_log WHERE date = ?").get("2099-01-01") as any;
    expect(row).toBeTruthy();
    expect(row.sales).toBe(1500.5);
    expect(row.customers).toBe(75);
    expect(row.sector).toBe("gym");
  });

  it("upserts (updates) an existing entry for the same date", () => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO daily_log (date, sector, sales, customers)
      VALUES (?, 'gym', ?, ?)
      ON CONFLICT(date) DO UPDATE SET sales = excluded.sales, customers = excluded.customers
    `);
    stmt.run("2099-01-02", 800, 40);
    stmt.run("2099-01-02", 999, 50);

    const row = db.prepare("SELECT * FROM daily_log WHERE date = ?").get("2099-01-02") as any;
    expect(row.sales).toBe(999);
    expect(row.customers).toBe(50);
  });

  it("GET summary logic returns totals and series", () => {
    const db = getDb();
    // Ensure our test rows exist
    db.prepare(`
      INSERT INTO daily_log (date, sector, sales, customers)
      VALUES (?, 'gym', ?, ?)
      ON CONFLICT(date) DO UPDATE SET sales = excluded.sales, customers = excluded.customers
    `).run("2099-01-03", 600, 30);

    const series = db.prepare("SELECT * FROM daily_log ORDER BY date ASC").all() as any[];
    const totals = series.reduce(
      (acc: any, row: any) => ({ sales: acc.sales + row.sales, customers: acc.customers + row.customers }),
      { sales: 0, customers: 0 }
    );

    expect(Array.isArray(series)).toBe(true);
    expect(series.length).toBeGreaterThanOrEqual(3);
    expect(typeof totals.sales).toBe("number");
    expect(typeof totals.customers).toBe("number");
    expect(totals.sales).toBeGreaterThan(0);
  });
});
