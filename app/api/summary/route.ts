import { NextResponse } from "next/server";
import { getDb, type DailyLog } from "@/db/database";

export async function GET() {
  const db = getDb();

  const series = db
    .prepare("SELECT * FROM daily_log ORDER BY date ASC")
    .all() as DailyLog[];

  const totals = series.reduce(
    (acc, row) => ({
      sales: acc.sales + row.sales,
      customers: acc.customers + row.customers,
    }),
    { sales: 0, customers: 0 }
  );

  return NextResponse.json({ totals, series });
}
