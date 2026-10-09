import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { listContacts } from "@/lib/production/contacts";
import { assignSubjects, outreachBody } from "@/lib/production/message";
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

const LOCKED_STATUSES = new Set<ProductionDraft["status"]>(["sent", "sending", "send_unknown"]);

export function draftIsLocked(draft: ProductionDraft) {
  return LOCKED_STATUSES.has(draft.status);
}

export async function createDraft(contactId: string) {
  const contact = (await listContacts()).find((value) => value.id === contactId);
  if (!contact) throw new Error("Contact not found");
  if (!contact.email) throw new Error("This contact has no email route");
  if (contact.status === "suppressed") throw new Error("Contact is suppressed");
  const drafts = await listDrafts();
  if (drafts.some((draft) => draft.contactId === contactId && draft.status !== "failed")) {
    throw new Error("A draft already exists for this contact");
  }
  const now = new Date().toISOString();
  const ref = db().collection("production_drafts").doc();
  const draft: ProductionDraft = {
    id: ref.id,
    contactId,
    to: contact.email,
    subject: assignSubjects([contact], drafts.map((item) => item.subject)).get(contact.id) ?? "looking for a top tier music video?",
    body: outreachBody(contact),
    status: "draft",
    trackOpens: true,
    trackingToken: randomBytes(24).toString("base64url"),
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(draft);
  return draft;
}

export type PreparedOutreach = {
  id: string;
  contactId: string;
  to: string;
  subject: string;
  name: string;
  company: string;
};

export type SkippedOutreach = { contactId: string; reason: string };

/**
 * Writes Zeb's note and a unique subject for each selected contact, marked ready.
 * Contacts already sent, missing an email, or suppressed are skipped.
 * Empty consent fields are recorded only because the sender confirmed this batch.
 */
export async function prepareOutreach(contactIds: string[]) {
  const ids = [...new Set(contactIds.map((id) => id.trim()).filter(Boolean))].slice(0, 500);
  if (!ids.length) throw new Error("Select at least one contact");
  const [contacts, drafts] = await Promise.all([listContacts(), listDrafts()]);
  const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
  const draftsByContact = new Map<string, ProductionDraft[]>();
  for (const draft of drafts) {
    const group = draftsByContact.get(draft.contactId) ?? [];
    group.push(draft);
    draftsByContact.set(draft.contactId, group);
  }

  const eligible: ProductionContact[] = [];
  const skipped: SkippedOutreach[] = [];
  for (const id of ids) {
    const contact = contactById.get(id);
    if (!contact) {
      skipped.push({ contactId: id, reason: "Contact not found" });
      continue;
    }
    if (!contact.email) {
      skipped.push({ contactId: id, reason: "No email on file" });
      continue;
    }
    if (contact.status === "suppressed") {
      skipped.push({ contactId: id, reason: "Suppressed" });
      continue;
    }
    if ((draftsByContact.get(id) ?? []).some(draftIsLocked)) {
      skipped.push({ contactId: id, reason: "Already sent" });
      continue;
    }
    eligible.push(contact);
  }

  const reserved = drafts.filter(draftIsLocked).map((draft) => draft.subject);
  const subjects = assignSubjects(eligible, reserved);
  const now = new Date().toISOString();
  const prepared: PreparedOutreach[] = [];
  const firestore = db();
  let batch = firestore.batch();
  let writes = 0;

  async function flush() {
    if (!writes) return;
    await batch.commit();
    batch = firestore.batch();
    writes = 0;
  }

  for (const contact of eligible) {
    const existing = (draftsByContact.get(contact.id) ?? []).find((draft) => !draftIsLocked(draft));
    const ref = existing ? firestore.collection("production_drafts").doc(existing.id) : firestore.collection("production_drafts").doc();
    const subject = subjects.get(contact.id) ?? "looking for a top tier music video?";
    const draft: ProductionDraft = {
      id: ref.id,
      contactId: contact.id,
      to: contact.email,
      subject,
      body: outreachBody(contact),
      status: "ready",
      trackOpens: existing?.trackOpens ?? true,
      trackingToken: existing?.trackingToken ?? randomBytes(24).toString("base64url"),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    batch.set(ref, draft);
    writes += 1;
    if (!contact.consentBasis.trim()) {
      batch.update(firestore.collection("production_contacts").doc(contact.id), {
        consentBasis: "Sender approved outreach to this publicly listed business address.",
        updatedAt: now,
      });
      writes += 1;
    }
    if (writes >= 400) await flush();
    prepared.push({ id: draft.id, contactId: contact.id, to: draft.to, subject, name: contact.name, company: contact.company });
  }
  await flush();
  return { prepared, skipped };
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
