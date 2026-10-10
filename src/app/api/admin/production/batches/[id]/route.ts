import { NextResponse, after } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { pauseBatch, processBatch, resumeBatch } from "@/lib/production/batches";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    const { action } = z.object({ action: z.enum(["pause", "resume"]) }).parse(await request.json());
    if (action === "pause") await pauseBatch(id);
    else { await resumeBatch(id); after(() => processBatch(id)); }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Batch update failed" }, { status: 400 });
  }
}
