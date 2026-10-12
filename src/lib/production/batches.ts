import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { listContacts } from "@/lib/production/contacts";
import { attestedOutreachBasis, hasRecordedBasis } from "@/lib/production/eligibility";
import { listDrafts, sendDraft } from "@/lib/production/outreach";
import { draftPlaceholders } from "@/lib/production/message";
import { ProductionSendBatch } from "@/types/production-types";
import { productionMailStatus } from "@/lib/production/mailStatus";
import { randomBytes } from "node:crypto";

function db() { if (!adminDb) throw new Error("Firebase Admin is not configured"); return adminDb; }
const batches = () => db().collection("production_send_batches");

export async function listBatches(): Promise<ProductionSendBatch[]> {
  const snapshot = await batches().orderBy("createdAt", "desc").limit(50).get();
  const now = Date.now();
  const output: ProductionSendBatch[] = [];
  for (const doc of snapshot.docs) {
    const batch = doc.data() as ProductionSendBatch;
    if (batch.status === "running" && now - Date.parse(batch.updatedAt) > 10 * 60_000) {
      batch.status = "paused";
      batch.pauseReason = "interrupted";
      batch.updatedAt = new Date().toISOString();
      await doc.ref.update({ status: "paused", pauseReason: "interrupted", updatedAt: batch.updatedAt });
    }
    output.push(batch);
  }
  return output;
}

export async function startBatch(draftIds: string[], sharedBasis: string, trackImageRequests = true): Promise<ProductionSendBatch> {
  if (!(await productionMailStatus()).canSend) throw new Error("Complete SMTP, sender address, and portfolio approval before sending");
  const basis = sharedBasis.trim();
  if (basis.length < 10 || basis.length > 300) throw new Error("Write one outreach basis of 10 to 300 characters for the batch");
  const ids = [...new Set(draftIds)];
  if (!ids.length || ids.length > 100) throw new Error("Select 1 to 100 reviewed drafts");
  const [drafts, contacts, previous] = await Promise.all([listDrafts(), listContacts(), listBatches()]);
  if (previous.some((batch) => batch.status !== "complete" && batch.items.some((item) => item.status === "pending"))) {
    throw new Error("Finish or inspect the current batch before starting another");
  }
  const selected = ids.map((id) => drafts.find((draft) => draft.id === id));
  if (selected.some((draft) => !draft || draft.status !== "ready")) throw new Error("Every selected email must be marked ready");
  const unfinished = selected.filter((draft) => draft && draftPlaceholders(draft.body).length);
  if (unfinished.length) throw new Error(`${unfinished.length} selected drafts still contain placeholders. Repair them in Email history before sending.`);
  if (new Set(selected.map((draft) => draft?.contactId)).size !== ids.length) throw new Error("One email per contact per batch");
  if (new Set(selected.map((draft) => draft!.to.trim().toLowerCase())).size !== ids.length) throw new Error("Select only one email per recipient address");
  if (previous.some((batch) => batch.items.some((item) => ids.includes(item.draftId) && item.status === "pending"))) {
    throw new Error("A selected draft is in an unfinished batch");
  }
  const now = new Date().toISOString();
  const basisUpdates: { id: string; value: string }[] = [];
  for (const draft of selected) {
    const contact = contacts.find((value) => value.id === draft!.contactId);
    if (!contact || contact.status === "suppressed" || contact.email.toLowerCase() !== draft!.to.toLowerCase() || contacts.some((value) => value.email.toLowerCase() === draft!.to.toLowerCase() && value.status === "suppressed")) {
      throw new Error(`Contact ${draft?.to ?? ""} needs eligibility review`);
    }
    if (!hasRecordedBasis(contact.consentBasis)) {
      basisUpdates.push({ id: contact.id, value: attestedOutreachBasis(contact, now, basis) });
    }
  }
  const ref = batches().doc();
  const batch: ProductionSendBatch = { id: ref.id, draftIds: ids, status: "running", items: ids.map((draftId) => ({ draftId, status: "pending" })), createdAt: now, updatedAt: now, sharedBasis: basis, eligibilityAttestedAt: now };
  const write = db().batch();
  basisUpdates.forEach(({ id, value }) => write.update(db().collection("production_contacts").doc(id), { consentBasis: value, updatedAt: now }));
  selected.forEach((draft) => write.update(db().collection("production_drafts").doc(draft!.id), {
    trackOpens: trackImageRequests, trackingToken: draft!.trackingToken || randomBytes(24).toString("base64url"), updatedAt: now,
  }));
  write.set(ref, batch);
  await write.commit();
  return batch;
}

export async function pauseBatch(id: string) {
  const ref = batches().doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Batch not found");
  if (snapshot.data()?.status === "running") await ref.update({ status: "paused", pauseReason: "manual", updatedAt: new Date().toISOString() });
}

export async function resumeBatch(id: string) {
  const ref = batches().doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.status !== "paused") throw new Error("Batch is not paused");
  const batch = snapshot.data() as ProductionSendBatch;
  const drafts = await listDrafts();
  const items = batch.items.map((item) => {
    if (item.status !== "skipped" || !item.error?.includes("Replace all draft placeholders before sending")) return item;
    const draft = drafts.find((value) => value.id === item.draftId);
    return draft?.status === "ready" && !draftPlaceholders(draft.body).length ? { draftId: item.draftId, status: "pending" as const } : item;
  });
  const pending = items.filter((item) => item.status === "pending");
  if (!pending.length) throw new Error("No unsent drafts remain");
  const blocked = pending.map((item) => drafts.find((value) => value.id === item.draftId)).filter((draft) => !draft || draft.status !== "ready" || draftPlaceholders(draft.body).length);
  if (blocked.length) {
    const contacts = await listContacts();
    const names = blocked.slice(0, 5).map((draft) => contacts.find((contact) => contact.id === draft?.contactId)?.company || draft?.to || "missing draft");
    throw new Error(`${blocked.length} batch drafts still need repair or approval: ${names.join(", ")}. Open Email history & drafts, repair or edit them, then resume.`);
  }
  await ref.update({ items, status: "running", pauseReason: null, updatedAt: new Date().toISOString() });
}

export async function processBatch(id: string) {
  const startedAt = Date.now();
  const ref = batches().doc(id);
  const initial = await ref.get();
  if (!initial.exists) return;
  const entries = (initial.data() as ProductionSendBatch).items;
  for (const entry of entries) {
    if (entry.status !== "pending") continue;
    if (Date.now() - startedAt > 30_000) {
      await ref.update({ status: "paused", pauseReason: "time_window", updatedAt: new Date().toISOString() });
      return;
    }
    const current = await ref.get();
    if (!current.exists || current.data()?.status !== "running") return;
    try {
      await sendDraft(entry.draftId, true);
      const latest = await ref.get();
      const items = (latest.data() as ProductionSendBatch).items.map((item) => item.draftId === entry.draftId ? { ...item, status: "sent" as const } : item);
      await ref.update({ items, updatedAt: new Date().toISOString() });
    } catch (error) {
      const draft = (await listDrafts()).find((item) => item.id === entry.draftId);
      const status = draft?.status === "send_unknown" || draft?.status === "sending" ? "send_unknown" : draft?.status === "ready" ? "skipped" : "failed";
      const latest = await ref.get();
      const items = (latest.data() as ProductionSendBatch).items.map((item) => item.draftId === entry.draftId ? { ...item, status, error: error instanceof Error ? error.message : "Send failed" } : item);
      await ref.update({ items, status: "paused", pauseReason: "error", updatedAt: new Date().toISOString() });
      return;
    }
  }
  const final = await ref.get();
  if (final.data()?.status === "running") await ref.update({ status: "complete", updatedAt: new Date().toISOString() });
}
