import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { createShoot, listShoots } from "@/services/api/models";
import { SHOOT_STATUSES, ShootStatus } from "@/types/model-types";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Not authorized" }, { status: 403 });

export async function GET(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const shoots = await listShoots();
    return NextResponse.json({ shoots });
  } catch (error) {
    console.error("Error listing shoots:", error);
    return NextResponse.json(
      { error: "Unable to load shoots." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const status: ShootStatus = SHOOT_STATUSES.includes(body.status)
      ? body.status
      : "draft";

    const shoot = await createShoot({
      title: body.title,
      description: body.description ?? "",
      category: body.category ?? "",
      location: body.location,
      shootDate: body.shootDate,
      status,
      youtubeUrl: body.youtubeUrl,
      highlightOnPublic: Boolean(body.highlightOnPublic),
    });

    return NextResponse.json({ shoot }, { status: 201 });
  } catch (error) {
    console.error("Error creating shoot:", error);
    return NextResponse.json(
      { error: "Unable to create shoot." },
      { status: 500 }
    );
  }
}
