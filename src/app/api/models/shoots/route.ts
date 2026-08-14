import { NextResponse } from "next/server";
import { listPublicShoots } from "@/services/api/models";

export const dynamic = "force-dynamic";

// Public listing: only open castings and highlighted previous work
export async function GET() {
  try {
    const { open, highlights } = await listPublicShoots();
    return NextResponse.json({ open, highlights });
  } catch (error) {
    console.error("Error loading public shoots:", error);
    return NextResponse.json(
      { error: "Unable to load shoots right now." },
      { status: 500 }
    );
  }
}
