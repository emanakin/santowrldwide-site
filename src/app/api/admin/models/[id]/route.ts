import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import {
  deleteModel,
  getModelById,
  listShoots,
  updateModel,
} from "@/services/api/models";
import { RosterModelInput } from "@/types/model-types";

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
    const model = await getModelById(id);

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Shoots come along so the detail view can link and re-assign them
    const shoots = await listShoots();

    return NextResponse.json({ model, shoots });
  } catch (error) {
    console.error("Error loading model:", error);
    return NextResponse.json(
      { error: "Unable to load model." },
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

    const updates: Partial<RosterModelInput> = {};

    if (typeof body.fullName === "string") updates.fullName = body.fullName;
    if (typeof body.email === "string") updates.email = body.email;
    if (typeof body.phone === "string") updates.phone = body.phone;
    if (typeof body.instagram === "string") updates.instagram = body.instagram;
    if (typeof body.city === "string") updates.city = body.city;
    if (typeof body.notes === "string") updates.notes = body.notes;
    if (body.status === "active" || body.status === "past")
      updates.status = body.status;
    if (typeof body.saved === "boolean") updates.saved = body.saved;
    if (Array.isArray(body.shootIds)) updates.shootIds = body.shootIds;
    if (Array.isArray(body.photoUrls)) updates.photoUrls = body.photoUrls;

    const model = await updateModel(id, updates);

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { error: "Unable to update model." },
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
    await deleteModel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { error: "Unable to delete model." },
      { status: 500 }
    );
  }
}
