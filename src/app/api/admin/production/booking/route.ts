import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { addSlotRange, cancelSlot, listBookings, listSlots } from "@/lib/production/booking";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ slots: await listSlots(true), bookings: await listBookings() });
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { startLocal, endLocal } = z.object({ startLocal: z.string(), endLocal: z.string() }).parse(await request.json());
    return NextResponse.json({ slots: await addSlotRange(startLocal, endLocal) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add slot" }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    await cancelSlot(id);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove slot" }, { status: 400 }); }
}
