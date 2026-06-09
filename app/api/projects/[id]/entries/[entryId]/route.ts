import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/database";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; entryId: string }> }) {
  const { entryId } = await params;
  const db = getDb();
  db.prepare("DELETE FROM log_entries WHERE id = ?").run(entryId);
  return NextResponse.json({ ok: true });
}
