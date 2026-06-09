import { NextRequest, NextResponse } from "next/server";
import { getDb, type DailyLog } from "@/db/database";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !body.date || body.sales == null || body.customers == null) {
    return NextResponse.json(
      { error: "Missing required fields: date, sales, customers" },
      { status: 400 }
    );
  }

  const { date, sales, customers } = body;

  if (typeof sales !== "number" || typeof customers !== "number") {
    return NextResponse.json(
      { error: "sales and customers must be numbers" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be in YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO daily_log (date, sector, sales, customers)
    VALUES (?, 'gym', ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      sales = excluded.sales,
      customers = excluded.customers
  `).run(date, sales, customers);

  const row = db.prepare("SELECT * FROM daily_log WHERE date = ?").get(date) as DailyLog;

  return NextResponse.json(row, { status: 200 });
}
