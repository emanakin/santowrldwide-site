import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { getModelById } from "@/services/api/models";
import { sendModelReplyEmail } from "@/services/email/emailService";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const model = await getModelById(id);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    const result = await sendModelReplyEmail({
      to: model.email,
      fullName: model.fullName,
      subject,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Email sent." });
  } catch (error) {
    console.error("Error sending model email:", error);
    return NextResponse.json(
      { error: "Unable to send email." },
      { status: 500 }
    );
  }
}
