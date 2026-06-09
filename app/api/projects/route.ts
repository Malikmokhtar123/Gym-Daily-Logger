import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/database";

export async function GET() {
  const db = getDb();
  const projects = db.prepare(`
    SELECT p.*,
      COUNT(DISTINCT le.id) as entry_count,
      MAX(le.date) as last_entry
    FROM projects p
    LEFT JOIN log_entries le ON le.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO projects (name, icon, color) VALUES (?, ?, ?)
  `).run(body.name, body.icon || "📊", body.color || "#6366f1");

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(result.lastInsertRowid);

  // Insert default metrics if provided
  if (body.metrics && Array.isArray(body.metrics)) {
    for (const m of body.metrics) {
      db.prepare(`
        INSERT INTO metrics (project_id, name, unit, type, color) VALUES (?, ?, ?, ?, ?)
      `).run(result.lastInsertRowid, m.name, m.unit || "", m.type || "number", m.color || "#6366f1");
    }
  }

  return NextResponse.json(project, { status: 201 });
}
