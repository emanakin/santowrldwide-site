import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { importContacts } from "@/lib/production/contacts";
import { parse } from "csv-parse/sync";

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    const contacts = typeof body.csv === "string"
      ? parse(body.csv, { columns: true, skip_empty_lines: true, bom: true, trim: true })
      : body.contacts;
    if (!Array.isArray(contacts)) return NextResponse.json({ error: "CSV or contacts array required" }, { status: 400 });
    return NextResponse.json(await importContacts(contacts));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 400 });
  }
}
