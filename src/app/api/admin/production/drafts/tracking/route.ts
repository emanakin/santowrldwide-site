import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { enableTrackingForUnsentDrafts } from "@/lib/production/outreach";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { force } = z.object({ force: z.boolean().optional() }).parse(await request.json());
    return NextResponse.json(await enableTrackingForUnsentDrafts(force === true));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update draft tracking" }, { status: 500 });
  }
}
