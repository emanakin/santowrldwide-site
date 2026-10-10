import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { importReviewedResearch } from "@/lib/production/outreach";
import { parse } from "csv-parse/sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { csv } = await request.json();
    if (typeof csv !== "string") throw new Error("CSV required");
    const rows = parse(csv, { columns: true, skip_empty_lines: true, bom: true, trim: true });
    return NextResponse.json(await importReviewedResearch(rows));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 });
  }
}
