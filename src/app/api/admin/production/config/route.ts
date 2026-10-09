import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireSuperAdmin } from "@/lib/firebase/admin/auth";

export const dynamic = "force-dynamic";

function status() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SANTO_POSTAL_ADDRESS } = process.env;
  const port = Number(SMTP_PORT);
  const smtpConfigured = Boolean(SMTP_HOST && Number.isInteger(port) && port > 0 && port <= 65535 && SMTP_USER && SMTP_PASSWORD && SMTP_FROM);
  const postalAddressConfigured = Boolean(SANTO_POSTAL_ADDRESS?.trim());
  const portfolioReady = process.env.PRODUCTIONS_PORTFOLIO_READY === "true";
  return { smtpConfigured, postalAddressConfigured, portfolioReady, canSend: smtpConfigured && postalAddressConfigured && portfolioReady };
}

export async function GET(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(status());
}

export async function POST(request: Request) {
  if (!await requireSuperAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!status().smtpConfigured) return NextResponse.json({ error: "SMTP settings are incomplete" }, { status: 400 });
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
