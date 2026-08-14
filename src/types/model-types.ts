export type ShootStatus = "draft" | "open" | "closed" | "completed";

export type ApplicationStatus =
  | "applied"
  | "interviewed"
  | "selected"
  | "rejected";

export type RosterStatus = "active" | "past";

/** A casting call / production. Applications attach to one of these. */
export interface Shoot {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  location?: string;
  shootDate?: string;
  status: ShootStatus;
  youtubeUrl?: string;
  /** Completed shoots flagged here surface as previous work on /models */
  highlightOnPublic?: boolean;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShootInput {
  title: string;
  description: string;
  category: string;
  location?: string;
  shootDate?: string;
  status: ShootStatus;
  youtubeUrl?: string;
  highlightOnPublic?: boolean;
}

export interface ModelApplication {
  id: string;
  shootId: string;
  shootTitle?: string;
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  city?: string;
  note?: string;
  photoUrls: string[];
  status: ApplicationStatus;
  /** Set once the applicant is promoted onto the roster */
  modelId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A model Santo is working with or has worked with before. */
export interface RosterModel {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  city?: string;
  photoUrls: string[];
  notes?: string;
  status: RosterStatus;
  saved: boolean;
  shootIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RosterModelInput {
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  city?: string;
  notes?: string;
  status: RosterStatus;
  saved?: boolean;
  shootIds?: string[];
  photoUrls?: string[];
}

export const SHOOT_STATUSES: ShootStatus[] = [
  "draft",
  "open",
  "closed",
  "completed",
];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "applied",
  "interviewed",
  "selected",
  "rejected",
];

export const MAX_APPLICATION_PHOTOS = 5;
export const MIN_APPLICATION_PHOTOS = 1;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
