import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { archivePreviouslySentDraft } from "@/lib/production/outreach";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    return NextResponse.json(await archivePreviouslySentDraft(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save a Sent copy" }, { status: 400 });
  }
}
