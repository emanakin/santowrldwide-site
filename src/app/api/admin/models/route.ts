import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { createModel, listModels } from "@/services/api/models";
import { RosterStatus } from "@/types/model-types";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "Not authorized" }, { status: 403 });

export async function GET(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const models = await listModels();
    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error listing models:", error);
    return NextResponse.json(
      { error: "Unable to load models." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return unauthorized();

  try {
    const body = await request.json();

    if (!body.fullName || !String(body.fullName).trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!body.email || !String(body.email).trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const status: RosterStatus = body.status === "past" ? "past" : "active";

    const model = await createModel({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      instagram: body.instagram,
      city: body.city,
      notes: body.notes,
      status,
      saved: Boolean(body.saved),
      shootIds: Array.isArray(body.shootIds) ? body.shootIds : [],
      photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls : [],
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    console.error("Error creating model:", error);
    return NextResponse.json(
      { error: "Unable to create model." },
      { status: 500 }
    );
  }
}
