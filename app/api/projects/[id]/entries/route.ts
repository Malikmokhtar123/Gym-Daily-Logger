import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/database";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const entries = db.prepare(`
    SELECT le.*,
      GROUP_CONCAT(m.name || ':' || mv.value || ':' || m.unit || ':' || m.color || ':' || m.id) as metric_data
    FROM log_entries le
    LEFT JOIN metric_values mv ON mv.entry_id = le.id
    LEFT JOIN metrics m ON m.id = mv.metric_id
    WHERE le.project_id = ?
    GROUP BY le.id
    ORDER BY le.date DESC
  `).all(id);

  const parsed = entries.map((e: Record<string, unknown>) => ({
    ...e,
    metrics: e.metric_data
      ? String(e.metric_data).split(",").map((s: string) => {
          const [name, value, unit, color, metricId] = s.split(":");
          return { name, value: parseFloat(value), unit, color, metricId: parseInt(metricId) };
        })
      : [],
  }));

  // Calculate streak
  const dates = entries.map((e: Record<string, unknown>) => e.date as string).sort();
  let streak = 0;
  if (dates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const lastDate = dates[dates.length - 1];
    if (lastDate === today || lastDate === yesterday) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const curr = new Date(dates[i + 1]);
        const prev = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        if (diff === 1) streak++;
        else break;
      }
    }
  }

  return NextResponse.json({ entries: parsed, streak });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const db = getDb();

  // Upsert entry
  db.prepare(`
    INSERT INTO log_entries (project_id, date, note)
    VALUES (?, ?, ?)
    ON CONFLICT(project_id, date) DO UPDATE SET note = excluded.note
  `).run(id, body.date, body.note || null);

  const entry = db.prepare("SELECT * FROM log_entries WHERE project_id = ? AND date = ?").get(id, body.date) as { id: number };

  // Insert/update metric values
  if (body.values && typeof body.values === "object") {
    for (const [metricId, value] of Object.entries(body.values)) {
      db.prepare(`
        INSERT INTO metric_values (entry_id, metric_id, value)
        VALUES (?, ?, ?)
        ON CONFLICT(entry_id, metric_id) DO UPDATE SET value = excluded.value
      `).run(entry.id, parseInt(metricId), value);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
