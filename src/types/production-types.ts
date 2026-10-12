export const PRODUCTION_CITIES = [
  "Toronto", "Montreal", "Vancouver", "New York", "Los Angeles",
] as const;

export const CONTACT_CATEGORIES = [
  "record_label", "music_production", "artist_management", "model_agency",
  "stylist", "creative_producer", "assistant", "other",
] as const;

export const COMPANY_SCALES = ["independent", "boutique", "mid_size", "major", "unknown"] as const;
export const CONTACT_STATUSES = ["research", "qualified", "ready", "contacted", "replied", "suppressed"] as const;

export type ProductionContact = {
  id: string;
  name: string;
  role: string;
  company: string;
  websiteUrl?: string;
  city: string;
  category: string;
  companyScale: string;
  email: string;
  contactUrl: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  fitNote: string;
  consentBasis: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductionDraft = {
  id: string;
  contactId: string;
  to: string;
  subject: string;
  body: string;
  status: "draft" | "ready" | "sending" | "sent" | "send_unknown" | "failed";
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  providerMessageId?: string;
  sentCopyStatus?: "saving" | "saved" | "needs_attention";
  sentCopyError?: string;
  sentCopySavedAt?: string;
  trackOpens?: boolean;
  trackingToken?: string;
  openedAt?: string;
  lastOpenedAt?: string;
  openCount?: number;
  clickCount?: number;
  portfolioClickedAt?: string;
  portfolioLastClickedAt?: string;
  portfolioClickCount?: number;
  bookingClickedAt?: string;
  bookingLastClickedAt?: string;
  bookingClickCount?: number;
  error?: string;
  pitchAngle?: string;
  pitchSourceUrl?: string;
  pitchEvidence?: string;
};

export type ProductionSendBatch = {
  id: string;
  draftIds: string[];
  status: "running" | "paused" | "complete";
  pauseReason?: "time_window" | "manual" | "error" | "interrupted";
  eligibilityAttestedAt?: string;
  sharedBasis?: string;
  items: { draftId: string; status: "pending" | "sent" | "skipped" | "failed" | "send_unknown"; error?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type ProductionBookingSlot = { id: string; startsAt: string; endsAt: string; status: "open" | "booked" | "cancelled"; bookingId?: string };
export type ProductionBooking = { id: string; slotId: string; startsAt: string; endsAt: string; name: string; email: string; note: string; createdAt: string; confirmationError?: string };
