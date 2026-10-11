import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";
import { productionMailStatus, setPortfolioApproval } from "@/lib/production/mailStatus";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await productionMailStatus());
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await productionMailStatus()).smtpConfigured) return NextResponse.json({ error: "SMTP settings are incomplete" }, { status: 400 });
  const port = Number(process.env.SMTP_PORT);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
  try {
    await transport.verify();
    return NextResponse.json({ verified: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "SMTP connection failed" }, { status: 502 });
  } finally {
    transport.close();
  }
}

export async function PATCH(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { approved } = z.object({ approved: z.boolean(), confirmReview: z.literal(true) }).parse(await request.json());
    return NextResponse.json(await setPortfolioApproval(approved));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update approval" }, { status: 400 });
  }
}
