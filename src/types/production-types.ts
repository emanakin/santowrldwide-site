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
  trackOpens?: boolean;
  trackingToken?: string;
  openedAt?: string;
  lastOpenedAt?: string;
  openCount?: number;
  error?: string;
};
