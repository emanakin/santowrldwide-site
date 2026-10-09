import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { listContacts } from "@/lib/production/contacts";
import { ProductionContact, ProductionDraft } from "@/types/production-types";
import nodemailer from "nodemailer";
import { randomBytes } from "node:crypto";
import { z } from "zod";

const draftEdit = z.object({
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(30).max(10000),
  status: z.enum(["draft", "ready"]).optional(),
  trackOpens: z.boolean().optional(),
});

function db() {
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  return adminDb;
}

export async function listDrafts(): Promise<ProductionDraft[]> {
  const snapshot = await db().collection("production_drafts").limit(2000).get();
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ProductionDraft))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createDraft(contactId: string) {
  const contact = (await listContacts()).find((value) => value.id === contactId);
  if (!contact) throw new Error("Contact not found");
  if (!contact.email) throw new Error("This contact has no email route");
  if (contact.status === "suppressed") throw new Error("Contact is suppressed");
  if ((await listDrafts()).some((draft) => draft.contactId === contactId && draft.status !== "failed")) {
    throw new Error("A draft already exists for this contact");
  }
  const firstName = contact.name.split(/\s+/)[0];
  const greeting = firstName && !/^(team|general|hello|contact)$/i.test(firstName) ? `Hi ${firstName},` : "Hello,";
  const now = new Date().toISOString();
  const ref = db().collection("production_drafts").doc();
  const draft: ProductionDraft = {
    id: ref.id,
    contactId,
    to: contact.email,
    subject: `Visual production for ${contact.company}`,
    body: `${greeting}\n\nI'm reaching out from SANTOWRLDWIDE. [Add Santo's approved positioning and a specific, verified reason for contacting ${contact.company}.]\n\nWe are interested in opportunities for music video direction and visual production. You can view our selected work at https://santowrldwide.com/productions. If there is a project where our approach could be useful, I'd love to hear about it.\n\nBest,\nSANTOWRLDWIDE`,
    status: "draft",
    trackOpens: true,
    trackingToken: randomBytes(24).toString("base64url"),
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(draft);
  return draft;
}

export async function updateDraft(id: string, raw: unknown) {
  const input = draftEdit.parse(raw);
  const ref = db().collection("production_drafts").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Draft not found");
  const old = snapshot.data() as ProductionDraft;
  if (old.status !== "draft" && old.status !== "ready") throw new Error("This draft can no longer be edited");
  const value = { ...old, ...input, id, updatedAt: new Date().toISOString() };
  await ref.set(value);
  return value;
}

function requireSmtp() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SANTO_POSTAL_ADDRESS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !SANTO_POSTAL_ADDRESS) {
    throw new Error("SMTP and sender identity are not fully configured");
  }
  if (process.env.PRODUCTIONS_PORTFOLIO_READY !== "true") {
    throw new Error("Approve and publish the Productions portfolio before outreach sending");
  }
  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP port");
  return { host: SMTP_HOST, port, user: SMTP_USER, password: SMTP_PASSWORD, from: SMTP_FROM, address: SANTO_POSTAL_ADDRESS };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function messageHtml(draft: ProductionDraft, address: string) {
  const visible = `<div style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(draft.body)}</div><p style="font-family:Arial,sans-serif">SANTOWRLDWIDE · ${escapeHtml(address)}<br>If you'd prefer no further outreach, reply “unsubscribe” and we'll remove you from our list.</p>`;
  if (!draft.trackOpens || !draft.trackingToken) return visible;
  const base = (process.env.SANTO_SITE_URL || "https://santowrldwide.com").replace(/\/$/, "");
  const url = new URL(`${base}/api/production/open/${draft.trackingToken}`);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("SANTO_SITE_URL must use HTTPS");
  return `${visible}<img src="${escapeHtml(url.toString())}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0">`;
}

function ensureEligible(contact: ProductionContact, draft: ProductionDraft, contacts: ProductionContact[]) {
  if (draft.status !== "ready") throw new Error("Review and mark the draft ready before sending");
  if (!contact.email || contact.email.toLowerCase() !== draft.to.toLowerCase()) throw new Error("Recipient no longer matches contact");
  if (!contact.consentBasis.trim()) throw new Error("Record the legal basis for this contact before sending");
  if (contact.status === "suppressed" || contacts.some((value) => value.email && value.email.toLowerCase() === contact.email.toLowerCase() && value.status === "suppressed")) {
    throw new Error("Recipient is suppressed");
  }
}

export async function sendDraft(id: string, confirm: boolean) {
  if (!confirm) throw new Error("Explicit send confirmation is required");
  const configuration = requireSmtp();
  const ref = db().collection("production_drafts").doc(id);
  const contacts = await listContacts();
  const existing = await ref.get();
  if (!existing.exists) throw new Error("Draft not found");
  const draft = existing.data() as ProductionDraft;
  const contact = contacts.find((value) => value.id === draft.contactId);
  if (!contact) throw new Error("Contact not found");
  ensureEligible(contact, draft, contacts);
  if (/\[[^\]]+\]/.test(draft.body)) throw new Error("Replace all draft placeholders before sending");
  const html = messageHtml(draft, configuration.address);
  const contactRef = db().collection("production_contacts").doc(contact.id);
  await db().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const latestContact = await transaction.get(contactRef);
    if (!snapshot.exists || snapshot.data()?.status !== "ready") throw new Error("Draft has already been sent or is being sent");
    if (!latestContact.exists || latestContact.data()?.status === "suppressed") throw new Error("Recipient is suppressed or missing");
    if (latestContact.data()?.email?.toLowerCase() !== draft.to.toLowerCase() || !latestContact.data()?.consentBasis?.trim()) {
      throw new Error("Contact eligibility changed; review before sending");
    }
    transaction.update(ref, { status: "sending", updatedAt: new Date().toISOString() });
  });

  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.port === 465,
    auth: { user: configuration.user, pass: configuration.password },
  });
  try {
    const result = await transporter.sendMail({
      from: configuration.from,
      to: draft.to,
      replyTo: configuration.user,
      subject: draft.subject,
      text: `${draft.body}\n\nSANTOWRLDWIDE · ${configuration.address}\nIf you'd prefer no further outreach, reply "unsubscribe" and we'll remove you from our list.`,
      html,
    });
    const now = new Date().toISOString();
    await ref.update({ status: "sent", sentAt: now, updatedAt: now, providerMessageId: result.messageId });
    await contactRef.update({ status: "contacted", updatedAt: now });
    return { messageId: result.messageId };
  } catch (error) {
    // An SMTP timeout may occur after acceptance. Never retry automatically.
    await ref.update({ status: "send_unknown", updatedAt: new Date().toISOString(), error: error instanceof Error ? error.message : "Unknown SMTP error" });
    throw error;
  }
}
