import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/database";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const metrics = db.prepare("SELECT * FROM metrics WHERE project_id = ? ORDER BY id ASC").all(id);
  return NextResponse.json(metrics);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO metrics (project_id, name, unit, type, color) VALUES (?, ?, ?, ?, ?)
  `).run(id, body.name, body.unit || "", body.type || "number", body.color || "#6366f1");

  const metric = db.prepare("SELECT * FROM metrics WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(metric, { status: 201 });
}
