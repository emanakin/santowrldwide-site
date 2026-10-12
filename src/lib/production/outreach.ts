import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { listContacts } from "@/lib/production/contacts";
import { hasRecordedBasis } from "@/lib/production/eligibility";
import { assignSubjects, draftPlaceholders, matchingReviewedDraft, outreachBody } from "@/lib/production/message";
import { escapeHtml, renderLinksAsHtml } from "@/lib/production/emailHtml";
import { productionMailStatus } from "@/lib/production/mailStatus";
import { appendToSent } from "@/lib/production/sentCopy";
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

/** Enables image requests on existing unsent drafts without changing copy, approval, or send history. */
export async function enableTrackingForUnsentDrafts(force = false) {
  const marker = db().collection("production_settings").doc("draft_tracking_backfill_v1");
  if (!force && (await marker.get()).exists) return { eligible: 0, updated: 0, alreadyEnabled: 0, alreadyRun: true };
  const snapshot = await db().collection("production_drafts").limit(2000).get();
  const eligible = snapshot.docs.filter((doc) => ["draft", "ready"].includes(doc.data().status));
  const update = eligible.filter((doc) => doc.data().trackOpens !== true || !doc.data().trackingToken);
  for (let start = 0; start < update.length; start += 400) {
    const write = db().batch();
    for (const doc of update.slice(start, start + 400)) {
      write.update(doc.ref, {
        trackOpens: true,
        trackingToken: doc.data().trackingToken || randomBytes(24).toString("base64url"),
        updatedAt: new Date().toISOString(),
      }, { lastUpdateTime: doc.updateTime });
    }
    await write.commit();
  }
  await marker.set({ completedAt: new Date().toISOString(), updated: update.length });
  return { eligible: eligible.length, updated: update.length, alreadyEnabled: eligible.length - update.length, alreadyRun: false };
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
    subject: assignSubjects([contact], drafts.map((item) => item.subject)).get(contact.id) ?? `could we talk visuals for ${contact.company.toLowerCase()}?`,
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

const importRow = z.object({
  contactId: z.string().trim().min(1), company: z.string().trim().min(1),
  email: z.string().trim().email(), researchStatus: z.literal("verified"),
  importable: z.literal("yes"), pitchSourceUrl: z.string().trim().url(),
  pitchAngle: z.string().trim().min(8).max(500),
  pitchEvidence: z.string().trim().min(20).max(2000),
  subject: z.string().trim().min(3).max(200), body: z.string().trim().min(30).max(10000),
});

export async function importReviewedResearch(raw: unknown[]) {
  if (raw.length > 500) throw new Error("Import limit is 500 rows");
  const [contacts, drafts] = await Promise.all([listContacts(), listDrafts()]);
  const used = new Set(drafts.map((draft) => draft.contactId));
  const subjects = new Set(drafts.map((draft) => draft.subject.toLowerCase()));
  const result = { imported: 0, skipped: 0, errors: [] as { row: number; error: string }[] };
  const batch = db().batch();
  const now = new Date().toISOString();
  for (const [index, rawRow] of raw.entries()) {
    const row = importRow.safeParse(rawRow);
    if (!row.success) { result.skipped++; result.errors.push({ row: index + 2, error: "Not a verified email draft or missing evidence" }); continue; }
    const match = contacts.find((contact) => contact.id === row.data.contactId && contact.email.toLowerCase() === row.data.email.toLowerCase())
      ?? contacts.find((contact) => contact.email.toLowerCase() === row.data.email.toLowerCase() && contact.company.toLowerCase() === row.data.company.toLowerCase());
    if (!match || match.status === "suppressed" || used.has(match.id)) { result.skipped++; result.errors.push({ row: index + 2, error: "Contact missing, suppressed, or already has a draft" }); continue; }
    if (subjects.has(row.data.subject.toLowerCase()) || !row.data.subject.endsWith("?")) { result.skipped++; result.errors.push({ row: index + 2, error: "Subject must be a unique question" }); continue; }
    const ref = db().collection("production_drafts").doc();
    batch.set(ref, {
      id: ref.id, contactId: match.id, to: match.email, subject: row.data.subject,
      body: row.data.body, status: "draft", trackOpens: true,
      trackingToken: randomBytes(24).toString("base64url"),
      pitchAngle: row.data.pitchAngle, pitchSourceUrl: row.data.pitchSourceUrl,
      pitchEvidence: row.data.pitchEvidence, createdAt: now, updatedAt: now,
    } satisfies ProductionDraft);
    used.add(match.id);
    subjects.add(row.data.subject.toLowerCase());
    result.imported++;
  }
  if (result.imported) await batch.commit();
  return result;
}

/** Repairs only old unsent template drafts with a verified, matching research row. */
export async function repairPlaceholderDrafts(raw: unknown[]) {
  if (raw.length > 500) throw new Error("Repair limit is 500 rows");
  const [contacts, drafts] = await Promise.all([listContacts(), listDrafts()]);
  const reviewed: z.infer<typeof importRow>[] = [];
  for (const rawRow of raw) {
    const row = importRow.safeParse(rawRow);
    if (!row.success || draftPlaceholders(row.data.body).length || !row.data.subject.endsWith("?")) continue;
    reviewed.push(row.data);
  }
  const repairable = drafts.filter((draft) => ["draft", "ready"].includes(draft.status) && draftPlaceholders(draft.body).length);
  const result = { found: repairable.length, repaired: 0, generalCopy: 0, unresolved: [] as string[] };
  const write = db().batch();
  const now = new Date().toISOString();
  const reservedSubjects = new Set(drafts.map((draft) => draft.subject.toLowerCase()));
  for (const draft of repairable) {
    const contact = contacts.find((item) => item.id === draft.contactId);
    const row = contact && matchingReviewedDraft(reviewed, contact, draft.to);
    if (!contact || contact.status === "suppressed" || contact.email.toLowerCase() !== draft.to.toLowerCase()) {
      result.unresolved.push(`${contact?.company || draft.to} (${draft.to})`);
      continue;
    }
    if (row && !drafts.some((other) => other.id !== draft.id && other.subject.toLowerCase() === row.subject.toLowerCase())) {
      write.update(db().collection("production_drafts").doc(draft.id), {
        subject: row.subject, body: row.body,
        pitchAngle: row.pitchAngle, pitchSourceUrl: row.pitchSourceUrl, pitchEvidence: row.pitchEvidence,
        updatedAt: now,
      });
      reservedSubjects.add(row.subject.toLowerCase());
    } else if (contact.sourceUrl) {
      // A source may verify the contact route without supporting a company-specific claim.
      // Use transparent introductory copy instead of keeping an unsendable template.
      const subject = assignSubjects([contact], reservedSubjects).get(contact.id)!;
      write.update(db().collection("production_drafts").doc(draft.id), {
        subject, body: outreachBody(contact), updatedAt: now,
      });
      reservedSubjects.add(subject.toLowerCase());
      result.generalCopy++;
    } else {
      result.unresolved.push(`${contact.company} (${draft.to})`);
      continue;
    }
    result.repaired++;
  }
  if (result.repaired) await write.commit();
  return result;
}

export async function updateDraft(id: string, raw: unknown) {
  const input = draftEdit.parse(raw);
  const ref = db().collection("production_drafts").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Draft not found");
  const old = snapshot.data() as ProductionDraft;
  if (old.status !== "draft" && old.status !== "ready") throw new Error("This draft can no longer be edited");
  const value = { ...old, ...input, status: input.status ?? old.status, id, updatedAt: new Date().toISOString() };
  if (value.status === "ready" && draftPlaceholders(value.body).length) throw new Error("Replace all draft placeholders before marking ready");
  await ref.set(value);
  return value;
}

export async function markDraftsReady(ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length || unique.length > 500) throw new Error("Select 1 to 500 drafts");
  const refs = unique.map((id) => db().collection("production_drafts").doc(id));
  await db().runTransaction(async (transaction) => {
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    if (snapshots.some((snapshot) => !snapshot.exists || snapshot.data()?.status !== "draft")) {
      throw new Error("Selection includes a missing or already processed draft. Refresh and try again.");
    }
    if (snapshots.some((snapshot) => draftPlaceholders(String(snapshot.data()?.body || "")).length)) {
      throw new Error("Some selected drafts still contain placeholders. Repair or edit them before marking ready.");
    }
    const updatedAt = new Date().toISOString();
    refs.forEach((ref) => transaction.update(ref, { status: "ready", updatedAt }));
  });
  return { updated: unique.length };
}

function mailSettings() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SANTO_POSTAL_ADDRESS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM || !SANTO_POSTAL_ADDRESS) {
    throw new Error("SMTP and sender identity are not fully configured");
  }
  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP port");
  return { host: SMTP_HOST, port, user: SMTP_USER, password: SMTP_PASSWORD, from: SMTP_FROM, address: SANTO_POSTAL_ADDRESS };
}

async function requireSmtp() {
  const settings = mailSettings();
  if (!(await productionMailStatus()).portfolioReady) {
    throw new Error("Approve and publish the Productions portfolio before outreach sending");
  }
  return settings;
}

function messageHtml(draft: ProductionDraft, address: string) {
  const visible = `<div style="white-space:pre-wrap;font-family:Arial,sans-serif">${renderLinksAsHtml(draft.body)}</div><p style="font-family:Arial,sans-serif">SANTOWRLDWIDE · ${escapeHtml(address)}<br>no more emails? reply “no thanks” and i won't follow up.</p>`;
  if (!draft.trackOpens || !draft.trackingToken) return visible;
  const base = (process.env.SANTO_SITE_URL || "https://santowrldwide.com").replace(/\/$/, "");
  const url = new URL(`${base}/api/production/open/${draft.trackingToken}`);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("SANTO_SITE_URL must use HTTPS");
  return `${visible}<img src="${escapeHtml(url.toString())}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0">`;
}

async function composeRawMessage(draft: ProductionDraft, configuration: ReturnType<typeof mailSettings>) {
  const compiled = await nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "windows" }).sendMail({
    from: configuration.from,
    to: draft.to,
    replyTo: configuration.user,
    subject: draft.subject,
    text: `${draft.body}\n\nSANTOWRLDWIDE · ${configuration.address}\nno more emails? reply "no thanks" and i won't follow up.`,
    html: messageHtml(draft, configuration.address),
    ...(draft.providerMessageId ? { messageId: draft.providerMessageId } : {}),
    ...(draft.sentAt ? { date: new Date(draft.sentAt) } : {}),
  });
  if (!Buffer.isBuffer(compiled.message)) throw new Error("Could not prepare the email copy");
  return { raw: compiled.message, messageId: compiled.messageId };
}

function ensureEligible(contact: ProductionContact, draft: ProductionDraft, contacts: ProductionContact[]) {
  if (draft.status !== "ready") throw new Error("Review and mark the draft ready before sending");
  if (!contact.email || contact.email.toLowerCase() !== draft.to.toLowerCase()) throw new Error("Recipient no longer matches contact");
  if (!hasRecordedBasis(contact.consentBasis)) throw new Error("Record the legal basis for this contact before sending");
  if (contact.status === "suppressed" || contacts.some((value) => value.email && value.email.toLowerCase() === contact.email.toLowerCase() && value.status === "suppressed")) {
    throw new Error("Recipient is suppressed");
  }
}

export async function sendDraft(id: string, confirm: boolean) {
  if (!confirm) throw new Error("Explicit send confirmation is required");
  const configuration = await requireSmtp();
  const ref = db().collection("production_drafts").doc(id);
  const contacts = await listContacts();
  const existing = await ref.get();
  if (!existing.exists) throw new Error("Draft not found");
  const draft = existing.data() as ProductionDraft;
  const contact = contacts.find((value) => value.id === draft.contactId);
  if (!contact) throw new Error("Contact not found");
  ensureEligible(contact, draft, contacts);
  if (draftPlaceholders(draft.body).length) throw new Error(`Replace draft placeholder for ${contact.company}: ${draftPlaceholders(draft.body)[0]}`);
  const composed = await composeRawMessage(draft, configuration);
  const contactRef = db().collection("production_contacts").doc(contact.id);
  await db().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const latestContact = await transaction.get(contactRef);
    if (!snapshot.exists || snapshot.data()?.status !== "ready") throw new Error("Draft has already been sent or is being sent");
    if (!latestContact.exists || latestContact.data()?.status === "suppressed") throw new Error("Recipient is suppressed or missing");
    if (latestContact.data()?.email?.toLowerCase() !== draft.to.toLowerCase() || !hasRecordedBasis(latestContact.data()?.consentBasis)) {
      throw new Error("Contact eligibility changed; review before sending");
    }
    transaction.update(ref, { status: "sending", updatedAt: new Date().toISOString() });
  });

  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.port === 465,
    auth: { user: configuration.user, pass: configuration.password },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
  try {
    await transporter.sendMail({ raw: composed.raw, envelope: { from: configuration.user, to: draft.to } });
  } catch (error) {
    // An SMTP timeout may occur after acceptance. Never retry automatically.
    await ref.update({ status: "send_unknown", updatedAt: new Date().toISOString(), error: error instanceof Error ? error.message : "Unknown SMTP error" });
    throw error;
  }
  const now = new Date().toISOString();
  await ref.update({ status: "sent", sentAt: now, updatedAt: now, providerMessageId: composed.messageId, sentCopyStatus: "saving" });
  await contactRef.update({ status: "contacted", updatedAt: now });
  try {
    // The mailbox copy omits the pixel so viewing Sent never registers as a recipient image request.
    const archive = await composeRawMessage({ ...draft, trackOpens: false, providerMessageId: composed.messageId, sentAt: now }, configuration);
    await appendToSent(archive.raw, composed.messageId, now);
    await ref.update({ sentCopyStatus: "saved", sentCopySavedAt: new Date().toISOString(), sentCopyError: null });
  } catch (error) {
    await ref.update({ sentCopyStatus: "needs_attention", sentCopyError: error instanceof Error ? error.message : "IMAP Sent copy failed" });
  }
  return { messageId: composed.messageId };
}

export async function archivePreviouslySentDraft(id: string) {
  const ref = db().collection("production_drafts").doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.status !== "sent") throw new Error("Only previously sent messages can be saved to Sent");
  const draft = snapshot.data() as ProductionDraft;
  if (!draft.providerMessageId || !draft.sentAt) throw new Error("This sent record lacks a Message-ID or send time");
  if (draft.sentCopyStatus === "saved") return { alreadySaved: true };
  const configuration = mailSettings();
  const composed = await composeRawMessage({ ...draft, trackOpens: false }, configuration);
  await db().runTransaction(async (transaction) => {
    const latest = await transaction.get(ref);
    if (!latest.exists || latest.data()?.status !== "sent" || latest.data()?.sentCopyStatus === "saved") throw new Error("Sent record changed; refresh before trying again");
    if (latest.data()?.sentCopyStatus === "saving" && Date.now() - Date.parse(latest.data()?.sentCopyStartedAt || "") < 10 * 60_000) {
      throw new Error("Sent copy is already being saved");
    }
    transaction.update(ref, { sentCopyStatus: "saving", sentCopyStartedAt: new Date().toISOString() });
  });
  try {
    const result = await appendToSent(composed.raw, draft.providerMessageId, draft.sentAt);
    await ref.update({ sentCopyStatus: "saved", sentCopySavedAt: new Date().toISOString(), sentCopyError: null });
    return result;
  } catch (error) {
    await ref.update({ sentCopyStatus: "needs_attention", sentCopyError: error instanceof Error ? error.message : "IMAP Sent copy failed" });
    throw error;
  }
}
