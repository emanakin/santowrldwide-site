import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { listContacts, saveContact } from "@/lib/production/contacts";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  try {
    const current = (await listContacts()).find((contact) => contact.id === id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const update = await request.json();
    return NextResponse.json({ contact: await saveContact({ ...current, ...update }, id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update contact" }, { status: 400 });
  }
}
