import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import {
  ApplicationStatus,
  ModelApplication,
  RosterModel,
  RosterModelInput,
  Shoot,
  ShootInput,
  ShootStatus,
} from "@/types/model-types";

export const SHOOTS_COLLECTION = "shoots";
export const APPLICATIONS_COLLECTION = "model_applications";
export const MODELS_COLLECTION = "models";

function requireDb() {
  if (!adminDb) {
    throw new Error("Firestore is not initialized");
  }
  return adminDb;
}

type FirestoreValue = unknown;

function toIso(value: FirestoreValue): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date(0).toISOString();
}

/** Firestore rejects undefined values, so strip them before writing. */
function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/* -------------------------------------------------------------------------- */
/* Shoots                                                                      */
/* -------------------------------------------------------------------------- */

function serializeShoot(
  id: string,
  data: FirebaseFirestore.DocumentData
): Shoot {
  return {
    id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    description: data.description ?? "",
    category: data.category ?? "",
    location: data.location ?? undefined,
    shootDate: data.shootDate ?? undefined,
    status: (data.status ?? "draft") as ShootStatus,
    youtubeUrl: data.youtubeUrl ?? undefined,
    highlightOnPublic: data.highlightOnPublic ?? false,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

async function ensureUniqueSlug(
  base: string,
  ignoreId?: string
): Promise<string> {
  const db = requireDb();
  const candidateBase = base || "shoot";
  let candidate = candidateBase;
  let suffix = 2;

  // Slugs are used as the public route, so keep trying until one is free
  for (;;) {
    const snapshot = await db
      .collection(SHOOTS_COLLECTION)
      .where("slug", "==", candidate)
      .limit(2)
      .get();

    const taken = snapshot.docs.some((doc) => doc.id !== ignoreId);
    if (!taken) return candidate;

    candidate = `${candidateBase}-${suffix}`;
    suffix += 1;
  }
}

export async function listShoots(): Promise<Shoot[]> {
  const db = requireDb();
  const snapshot = await db.collection(SHOOTS_COLLECTION).get();

  return snapshot.docs
    .map((doc) => serializeShoot(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Open shoots plus any completed shoot flagged as a public highlight. */
export async function listPublicShoots(): Promise<{
  open: Shoot[];
  highlights: Shoot[];
}> {
  const all = await listShoots();

  return {
    open: all.filter((shoot) => shoot.status === "open"),
    highlights: all.filter(
      (shoot) => shoot.highlightOnPublic && shoot.status === "completed"
    ),
  };
}

export async function getShootById(id: string): Promise<Shoot | null> {
  const db = requireDb();
  const doc = await db.collection(SHOOTS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return serializeShoot(doc.id, doc.data() as FirebaseFirestore.DocumentData);
}

export async function getShootBySlug(slug: string): Promise<Shoot | null> {
  const db = requireDb();
  const snapshot = await db
    .collection(SHOOTS_COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return serializeShoot(doc.id, doc.data());
}

export async function createShoot(input: ShootInput): Promise<Shoot> {
  const db = requireDb();
  const now = Timestamp.now();
  const slug = await ensureUniqueSlug(slugify(input.title));

  const payload = stripUndefined({
    title: input.title.trim(),
    slug,
    description: input.description?.trim() ?? "",
    category: input.category?.trim() ?? "",
    location: input.location?.trim() || undefined,
    shootDate: input.shootDate || undefined,
    status: input.status,
    youtubeUrl: input.youtubeUrl?.trim() || undefined,
    highlightOnPublic: input.highlightOnPublic ?? false,
    createdAt: now,
    updatedAt: now,
  });

  const ref = await db.collection(SHOOTS_COLLECTION).add(payload);
  return serializeShoot(ref.id, payload);
}

export async function updateShoot(
  id: string,
  input: Partial<ShootInput>
): Promise<Shoot | null> {
  const db = requireDb();
  const ref = db.collection(SHOOTS_COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const current = existing.data() as FirebaseFirestore.DocumentData;
  const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };

  if (input.title !== undefined) {
    updates.title = input.title.trim();
    if (input.title.trim() !== current.title) {
      updates.slug = await ensureUniqueSlug(slugify(input.title), id);
    }
  }
  if (input.description !== undefined)
    updates.description = input.description.trim();
  if (input.category !== undefined) updates.category = input.category.trim();
  if (input.location !== undefined)
    updates.location = input.location.trim() || null;
  if (input.shootDate !== undefined) updates.shootDate = input.shootDate || null;
  if (input.status !== undefined) updates.status = input.status;
  if (input.youtubeUrl !== undefined)
    updates.youtubeUrl = input.youtubeUrl.trim() || null;
  if (input.highlightOnPublic !== undefined)
    updates.highlightOnPublic = input.highlightOnPublic;

  await ref.update(updates);

  const updated = await ref.get();
  return serializeShoot(
    updated.id,
    updated.data() as FirebaseFirestore.DocumentData
  );
}

export async function deleteShoot(id: string): Promise<void> {
  const db = requireDb();
  await db.collection(SHOOTS_COLLECTION).doc(id).delete();
}

/* -------------------------------------------------------------------------- */
/* Applications                                                                */
/* -------------------------------------------------------------------------- */

function serializeApplication(
  id: string,
  data: FirebaseFirestore.DocumentData
): ModelApplication {
  return {
    id,
    shootId: data.shootId ?? "",
    shootTitle: data.shootTitle ?? undefined,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? undefined,
    instagram: data.instagram ?? undefined,
    city: data.city ?? undefined,
    note: data.note ?? undefined,
    photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
    status: (data.status ?? "applied") as ApplicationStatus,
    modelId: data.modelId ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export interface CreateApplicationInput {
  shootId: string;
  shootTitle?: string;
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  city?: string;
  note?: string;
  photoUrls: string[];
}

export async function createApplication(
  input: CreateApplicationInput
): Promise<ModelApplication> {
  const db = requireDb();
  const now = Timestamp.now();

  const payload = stripUndefined({
    shootId: input.shootId,
    shootTitle: input.shootTitle,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    instagram: input.instagram,
    city: input.city,
    note: input.note,
    photoUrls: input.photoUrls,
    status: "applied" as ApplicationStatus,
    modelId: null,
    createdAt: now,
    updatedAt: now,
  });

  const ref = await db.collection(APPLICATIONS_COLLECTION).add(payload);
  return serializeApplication(ref.id, payload);
}

export async function listApplications(filters?: {
  shootId?: string;
  status?: ApplicationStatus;
}): Promise<ModelApplication[]> {
  const db = requireDb();
  let query: FirebaseFirestore.Query = db.collection(APPLICATIONS_COLLECTION);

  if (filters?.shootId) {
    query = query.where("shootId", "==", filters.shootId);
  }
  if (filters?.status) {
    query = query.where("status", "==", filters.status);
  }

  const snapshot = await query.get();

  return snapshot.docs
    .map((doc) => serializeApplication(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApplicationById(
  id: string
): Promise<ModelApplication | null> {
  const db = requireDb();
  const doc = await db.collection(APPLICATIONS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return serializeApplication(
    doc.id,
    doc.data() as FirebaseFirestore.DocumentData
  );
}

export async function updateApplication(
  id: string,
  updates: { status?: ApplicationStatus; modelId?: string | null }
): Promise<ModelApplication | null> {
  const db = requireDb();
  const ref = db.collection(APPLICATIONS_COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  await ref.update(
    stripUndefined({
      ...updates,
      updatedAt: Timestamp.now(),
    })
  );

  const updated = await ref.get();
  return serializeApplication(
    updated.id,
    updated.data() as FirebaseFirestore.DocumentData
  );
}

export async function deleteApplication(id: string): Promise<void> {
  const db = requireDb();
  await db.collection(APPLICATIONS_COLLECTION).doc(id).delete();
}

/* -------------------------------------------------------------------------- */
/* Roster models                                                               */
/* -------------------------------------------------------------------------- */

function serializeModel(
  id: string,
  data: FirebaseFirestore.DocumentData
): RosterModel {
  return {
    id,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? undefined,
    instagram: data.instagram ?? undefined,
    city: data.city ?? undefined,
    photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
    notes: data.notes ?? undefined,
    status: data.status === "past" ? "past" : "active",
    saved: Boolean(data.saved),
    shootIds: Array.isArray(data.shootIds) ? data.shootIds : [],
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function listModels(): Promise<RosterModel[]> {
  const db = requireDb();
  const snapshot = await db.collection(MODELS_COLLECTION).get();

  return snapshot.docs
    .map((doc) => serializeModel(doc.id, doc.data()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getModelById(id: string): Promise<RosterModel | null> {
  const db = requireDb();
  const doc = await db.collection(MODELS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return serializeModel(doc.id, doc.data() as FirebaseFirestore.DocumentData);
}

export async function createModel(
  input: RosterModelInput
): Promise<RosterModel> {
  const db = requireDb();
  const now = Timestamp.now();

  const payload = stripUndefined({
    fullName: input.fullName.trim(),
    email: input.email.toLowerCase().trim(),
    phone: input.phone?.trim() || undefined,
    instagram: input.instagram?.trim() || undefined,
    city: input.city?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    photoUrls: input.photoUrls ?? [],
    status: input.status,
    saved: input.saved ?? false,
    shootIds: input.shootIds ?? [],
    createdAt: now,
    updatedAt: now,
  });

  const ref = await db.collection(MODELS_COLLECTION).add(payload);
  return serializeModel(ref.id, payload);
}

export async function updateModel(
  id: string,
  input: Partial<RosterModelInput>
): Promise<RosterModel | null> {
  const db = requireDb();
  const ref = db.collection(MODELS_COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };

  if (input.fullName !== undefined) updates.fullName = input.fullName.trim();
  if (input.email !== undefined)
    updates.email = input.email.toLowerCase().trim();
  if (input.phone !== undefined) updates.phone = input.phone.trim() || null;
  if (input.instagram !== undefined)
    updates.instagram = input.instagram.trim() || null;
  if (input.city !== undefined) updates.city = input.city.trim() || null;
  if (input.notes !== undefined) updates.notes = input.notes.trim() || null;
  if (input.status !== undefined) updates.status = input.status;
  if (input.saved !== undefined) updates.saved = input.saved;
  if (input.shootIds !== undefined) updates.shootIds = input.shootIds;
  if (input.photoUrls !== undefined) updates.photoUrls = input.photoUrls;

  await ref.update(updates);

  const updated = await ref.get();
  return serializeModel(
    updated.id,
    updated.data() as FirebaseFirestore.DocumentData
  );
}

export async function deleteModel(id: string): Promise<void> {
  const db = requireDb();
  await db.collection(MODELS_COLLECTION).doc(id).delete();
}

/**
 * Moves a selected applicant onto the roster. Existing roster entries are
 * matched by email so the same person applying twice stays a single record.
 */
export async function promoteApplicationToModel(
  application: ModelApplication
): Promise<RosterModel> {
  const db = requireDb();
  const email = application.email.toLowerCase().trim();

  const existingSnapshot = await db
    .collection(MODELS_COLLECTION)
    .where("email", "==", email)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    const doc = existingSnapshot.docs[0];
    const current = serializeModel(doc.id, doc.data());
    const mergedShootIds = Array.from(
      new Set([...current.shootIds, application.shootId])
    );
    const mergedPhotos = Array.from(
      new Set([...current.photoUrls, ...application.photoUrls])
    );

    const updated = await updateModel(doc.id, {
      shootIds: mergedShootIds,
      photoUrls: mergedPhotos,
      status: "active",
    });

    return updated ?? current;
  }

  return createModel({
    fullName: application.fullName,
    email,
    phone: application.phone,
    instagram: application.instagram,
    city: application.city,
    notes: application.note,
    photoUrls: application.photoUrls,
    status: "active",
    saved: false,
    shootIds: [application.shootId],
  });
}
