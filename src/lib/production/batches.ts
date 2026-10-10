import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { listContacts } from "@/lib/production/contacts";
import { hasRecordedBasis } from "@/lib/production/eligibility";
import { listDrafts, sendDraft } from "@/lib/production/outreach";
import { ProductionSendBatch } from "@/types/production-types";

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
      batch.updatedAt = new Date().toISOString();
      await doc.ref.update({ status: "paused", updatedAt: batch.updatedAt });
    }
    output.push(batch);
  }
  return output;
}

export async function startBatch(draftIds: string[]): Promise<ProductionSendBatch> {
  const ids = [...new Set(draftIds)];
  if (!ids.length || ids.length > 10) throw new Error("Select 1 to 10 reviewed drafts");
  const [drafts, contacts, previous] = await Promise.all([listDrafts(), listContacts(), listBatches()]);
  const selected = ids.map((id) => drafts.find((draft) => draft.id === id));
  if (selected.some((draft) => !draft || draft.status !== "ready")) throw new Error("Every selected email must be marked ready");
  if (new Set(selected.map((draft) => draft?.contactId)).size !== ids.length) throw new Error("One email per contact per batch");
  if (previous.some((batch) => batch.items.some((item) => ids.includes(item.draftId) && item.status === "pending"))) {
    throw new Error("A selected draft is in an unfinished batch");
  }
  for (const draft of selected) {
    const contact = contacts.find((value) => value.id === draft!.contactId);
    if (!contact || !hasRecordedBasis(contact.consentBasis) || contact.status === "suppressed" || contact.email.toLowerCase() !== draft!.to.toLowerCase()) {
      throw new Error(`Contact ${draft?.to ?? ""} needs eligibility review`);
    }
  }
  const ref = batches().doc();
  const now = new Date().toISOString();
  const batch: ProductionSendBatch = { id: ref.id, draftIds: ids, status: "running", items: ids.map((draftId) => ({ draftId, status: "pending" })), createdAt: now, updatedAt: now };
  await ref.set(batch);
  return batch;
}

export async function pauseBatch(id: string) {
  const ref = batches().doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Batch not found");
  if (snapshot.data()?.status === "running") await ref.update({ status: "paused", updatedAt: new Date().toISOString() });
}

export async function resumeBatch(id: string) {
  const ref = batches().doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.status !== "paused") throw new Error("Batch is not paused");
  const batch = snapshot.data() as ProductionSendBatch;
  if (!batch.items.some((item) => item.status === "pending")) throw new Error("No unsent drafts remain");
  await ref.update({ status: "running", updatedAt: new Date().toISOString() });
}

export async function processBatch(id: string) {
  const ref = batches().doc(id);
  const initial = await ref.get();
  if (!initial.exists) return;
  const entries = (initial.data() as ProductionSendBatch).items;
  for (const entry of entries) {
    if (entry.status !== "pending") continue;
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
      await ref.update({ items, status: "paused", updatedAt: new Date().toISOString() });
      return;
    }
  }
  await ref.update({ status: "complete", updatedAt: new Date().toISOString() });
}
