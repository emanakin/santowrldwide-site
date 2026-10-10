import { NextResponse } from "next/server";
import { after } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { listBatches, processBatch, startBatch } from "@/lib/production/batches";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ batches: await listBatches() });
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = z.object({ draftIds: z.array(z.string().min(1)).min(1).max(10), confirmSend: z.literal(true) }).parse(await request.json());
    const batch = await startBatch(body.draftIds);
    after(() => processBatch(batch.id));
    return NextResponse.json({ batch }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Batch failed" }, { status: 400 });
  }
}
