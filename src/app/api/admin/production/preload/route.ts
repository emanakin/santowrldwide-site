import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { importContacts } from "@/lib/production/contacts";
import contacts from "@/data/production-contacts.json";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const result = await importContacts(contacts);
    return NextResponse.json({ total: contacts.length, imported: result.imported, skipped: result.errors.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Preload failed" }, { status: 400 });
  }
}
