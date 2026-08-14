import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import {
  deleteShoot,
  getShootById,
  listApplications,
  updateShoot,
} from "@/services/api/models";
import { SHOOT_STATUSES, ShootInput } from "@/types/model-types";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Not authorized" }, { status: 403 });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const shoot = await getShootById(id);

    if (!shoot) {
      return NextResponse.json({ error: "Shoot not found" }, { status: 404 });
    }

    const applications = await listApplications({ shootId: id });

    return NextResponse.json({ shoot, applications });
  } catch (error) {
    console.error("Error loading shoot:", error);
    return NextResponse.json(
      { error: "Unable to load shoot." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Partial<ShootInput> = {};

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.description === "string")
      updates.description = body.description;
    if (typeof body.category === "string") updates.category = body.category;
    if (typeof body.location === "string") updates.location = body.location;
    if (typeof body.shootDate === "string") updates.shootDate = body.shootDate;
    if (typeof body.youtubeUrl === "string")
      updates.youtubeUrl = body.youtubeUrl;
    if (typeof body.highlightOnPublic === "boolean")
      updates.highlightOnPublic = body.highlightOnPublic;
    if (SHOOT_STATUSES.includes(body.status)) updates.status = body.status;

    const shoot = await updateShoot(id, updates);

    if (!shoot) {
      return NextResponse.json({ error: "Shoot not found" }, { status: 404 });
    }

    return NextResponse.json({ shoot });
  } catch (error) {
    console.error("Error updating shoot:", error);
    return NextResponse.json(
      { error: "Unable to update shoot." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    await deleteShoot(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shoot:", error);
    return NextResponse.json(
      { error: "Unable to delete shoot." },
      { status: 500 }
    );
  }
}
