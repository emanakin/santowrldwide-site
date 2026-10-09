import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { listContacts, saveContact } from "@/lib/production/contacts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ contacts: await listContacts() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load contacts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json({ contact: await saveContact(await request.json()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create contact" }, { status: 400 });
  }
}
