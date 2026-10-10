import { NextResponse } from "next/server";
import { listSlots, reserveSlot } from "@/lib/production/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return NextResponse.json({ slots: await listSlots() }); }
  catch { return NextResponse.json({ error: "Could not load times" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try { return NextResponse.json({ booking: await reserveSlot(await request.json()) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Booking failed" }, { status: 400 }); }
}
