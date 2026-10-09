import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { CONTACT_CATEGORIES, CONTACT_STATUSES, COMPANY_SCALES, ProductionContact } from "@/types/production-types";
import { z } from "zod";

const webUrl = z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS URL");

export const contactInput = z.object({
  name: z.string().trim().min(1).max(160),
  role: z.string().trim().max(160).default(""),
  company: z.string().trim().min(1).max(160),
  websiteUrl: z.union([webUrl, z.literal("")]).default(""),
  city: z.string().trim().min(1).max(100),
  category: z.enum(CONTACT_CATEGORIES),
  companyScale: z.enum(COMPANY_SCALES).default("unknown"),
  email: z.union([z.string().trim().email(), z.literal("")]).default(""),
  contactUrl: z.union([webUrl, z.literal("")]).default(""),
  sourceUrl: webUrl,
  sourceCheckedAt: z.string().trim().min(10),
  fitNote: z.string().trim().max(1000).default(""),
  consentBasis: z.string().trim().max(500).default(""),
  status: z.enum(CONTACT_STATUSES).default("research"),
}).refine((value) => value.email || value.contactUrl, { message: "A verified email or contact URL is required" });

export type ContactInput = z.infer<typeof contactInput>;

function db() {
  if (!adminDb) throw new Error("Firebase Admin is not configured");
  return adminDb;
}

function key(value: Pick<ContactInput, "name" | "company" | "email">) {
  return value.email
    ? `email:${value.email.toLowerCase()}`
    : `name:${value.name.toLowerCase().replace(/\s+/g, " ")}|company:${value.company.toLowerCase().replace(/\s+/g, " ")}`;
}

export async function listContacts(): Promise<ProductionContact[]> {
  const snapshot = await db().collection("production_contacts").limit(2000).get();
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ProductionContact))
    .sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name));
}

export async function saveContact(raw: unknown, id?: string) {
  const parsed = contactInput.parse(raw);
  const contacts = await listContacts();
  const duplicate = contacts.find((contact) => contact.id !== id && key(contact) === key(parsed));
  if (duplicate) throw new Error(`Duplicate contact: ${duplicate.company} / ${duplicate.name}`);
  const now = new Date().toISOString();
  const ref = id ? db().collection("production_contacts").doc(id) : db().collection("production_contacts").doc();
  const existing = id ? await ref.get() : null;
  if (id && !existing?.exists) throw new Error("Contact not found");
  const value: ProductionContact = {
    ...parsed,
    id: ref.id,
    createdAt: (existing?.data()?.createdAt as string | undefined) ?? now,
    updatedAt: now,
  };
  await ref.set(value);
  return value;
}

export async function importContacts(raw: unknown[]) {
  if (raw.length > 500) throw new Error("Import limit is 500 rows");
  const existing = await listContacts();
  const seen = new Set(existing.map(key));
  const accepted: ContactInput[] = [];
  const errors: { row: number; error: string }[] = [];
  raw.forEach((value, index) => {
    const parsed = contactInput.safeParse(value);
    if (!parsed.success) {
      errors.push({ row: index + 2, error: parsed.error.issues.map((issue) => issue.message).join("; ") });
      return;
    }
    const dedupeKey = key(parsed.data);
    if (seen.has(dedupeKey)) {
      errors.push({ row: index + 2, error: "Duplicate contact" });
      return;
    }
    seen.add(dedupeKey);
    accepted.push(parsed.data);
  });
  const batch = db().batch();
  const now = new Date().toISOString();
  for (const input of accepted) {
    const ref = db().collection("production_contacts").doc();
    batch.set(ref, { ...input, id: ref.id, createdAt: now, updatedAt: now });
  }
  if (accepted.length) await batch.commit();
  return { imported: accepted.length, errors };
}

export const CSV_COLUMNS = [
  "id", "name", "role", "company", "websiteUrl", "city", "category", "companyScale", "email", "contactUrl",
  "sourceUrl", "sourceCheckedAt", "fitNote", "consentBasis", "status", "createdAt", "updatedAt",
] as const;

function csvCell(value: unknown) {
  const text = String(value ?? "");
  // The spreadsheet escape also blocks formula execution when the CSV is opened in Excel.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function contactsToCsv(contacts: ProductionContact[]) {
  return [CSV_COLUMNS.join(","), ...contacts.map((contact) => CSV_COLUMNS.map((column) => csvCell(contact[column])).join(","))].join("\r\n") + "\r\n";
}
