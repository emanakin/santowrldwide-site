import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import {
  deleteApplication,
  getApplicationById,
  getShootById,
  promoteApplicationToModel,
  updateApplication,
} from "@/services/api/models";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/types/model-types";

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
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const shoot = application.shootId
      ? await getShootById(application.shootId)
      : null;

    return NextResponse.json({ application, shoot });
  } catch (error) {
    console.error("Error loading application:", error);
    return NextResponse.json(
      { error: "Unable to load application." },
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
    const addToRoster = Boolean(body.addToRoster);
    const status = APPLICATION_STATUSES.includes(body.status)
      ? (body.status as ApplicationStatus)
      : undefined;

    if (!status && !addToRoster) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const existing = await getApplicationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    let modelId = existing.modelId ?? null;
    // Explicit add-to-roster, or selecting them, promotes onto the models list
    if (addToRoster || status === "selected") {
      const model = await promoteApplicationToModel(existing);
      modelId = model.id;
    }

    const application = await updateApplication(id, {
      status: status ?? existing.status,
      modelId,
    });

    return NextResponse.json({ application, modelId });
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
