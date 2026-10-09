import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { createDraft, listDrafts } from "@/lib/production/outreach";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ drafts: await listDrafts() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list drafts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    return NextResponse.json({ draft: await createDraft(String(body.contactId ?? "")) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create draft" }, { status: 400 });
  }
}
