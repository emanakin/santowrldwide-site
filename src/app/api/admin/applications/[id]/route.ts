import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import {
  deleteApplication,
  getApplicationById,
  promoteApplicationToModel,
  updateApplication,
} from "@/services/api/models";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/types/model-types";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Not authorized" }, { status: 403 });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as ApplicationStatus;

    if (!APPLICATION_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await getApplicationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Selecting an applicant also puts them on the roster
    let modelId = existing.modelId ?? null;
    if (status === "selected") {
      const model = await promoteApplicationToModel(existing);
      modelId = model.id;
    }

    const application = await updateApplication(id, { status, modelId });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Unable to update application." },
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
    await deleteApplication(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Unable to delete application." },
      { status: 500 }
    );
  }
}
