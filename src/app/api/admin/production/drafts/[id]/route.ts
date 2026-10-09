import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { updateDraft } from "@/lib/production/outreach";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    return NextResponse.json({ draft: await updateDraft(id, await request.json()) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update draft" }, { status: 400 });
  }
}
