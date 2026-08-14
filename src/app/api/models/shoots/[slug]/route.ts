import { NextResponse } from "next/server";
import { getShootBySlug } from "@/services/api/models";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const shoot = await getShootBySlug(slug);

    // Drafts are never exposed publicly, even by direct link
    if (!shoot || shoot.status === "draft") {
      return NextResponse.json({ error: "Shoot not found" }, { status: 404 });
    }

    return NextResponse.json({ shoot });
  } catch (error) {
    console.error("Error loading shoot:", error);
    return NextResponse.json(
      { error: "Unable to load this shoot right now." },
      { status: 500 }
    );
  }
}
