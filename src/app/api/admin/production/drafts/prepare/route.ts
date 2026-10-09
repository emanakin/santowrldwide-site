import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { prepareOutreach } from "@/lib/production/outreach";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  contactIds: z.array(z.string().trim().min(1)).min(1).max(500),
  recordApproval: z.literal(true),
});

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = bodySchema.parse(await request.json());
    return NextResponse.json(await prepareOutreach(body.contactIds));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to prepare emails";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
