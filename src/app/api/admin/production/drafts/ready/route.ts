import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { markDraftsReady } from "@/lib/production/outreach";
import { z } from "zod";

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { draftIds } = z.object({ draftIds: z.array(z.string().min(1)).min(1).max(500) }).parse(await request.json());
    return NextResponse.json(await markDraftsReady(draftIds));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not mark drafts ready" }, { status: 400 });
  }
}
