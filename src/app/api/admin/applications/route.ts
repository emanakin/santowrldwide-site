import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { listApplications } from "@/services/api/models";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/types/model-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const shootId = searchParams.get("shootId") || undefined;
    const statusParam = searchParams.get("status");
    const status = APPLICATION_STATUSES.includes(statusParam as ApplicationStatus)
      ? (statusParam as ApplicationStatus)
      : undefined;

    const applications = await listApplications({ shootId, status });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error listing applications:", error);
    return NextResponse.json(
      { error: "Unable to load applications." },
      { status: 500 }
    );
  }
}
