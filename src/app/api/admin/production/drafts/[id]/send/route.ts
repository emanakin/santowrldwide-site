import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { sendDraft } from "@/lib/production/outreach";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json(await sendDraft(id, body.confirmSend === true));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Send failed" }, { status: 400 });
  }
}
