export const AUTO_APPROVAL_TEXT = "Sender approved outreach to this publicly listed business address.";

export function hasRecordedBasis(value: string | undefined) {
  const basis = value?.trim();
  return Boolean(basis && basis !== AUTO_APPROVAL_TEXT);
}

type AttestedContact = { city: string; company: string; role: string; sourceUrl: string; sourceCheckedAt: string; email: string };

/** Records the owner's batch attestation; source claims are never inferred from a public address alone. */
export function attestedOutreachBasis(contact: AttestedContact, attestedAt: string, sharedBasis: string) {
  const note = sharedBasis.trim();
  if (note.length < 10 || note.length > 300) throw new Error("Write one outreach basis of 10 to 300 characters for the batch");
  if (!contact.email || !/^https?:\/\//i.test(contact.sourceUrl) || !contact.sourceCheckedAt || !contact.role) {
    throw new Error(`Complete the source, date, and role for ${contact.company} before sending`);
  }
  if (["Toronto", "Montreal", "Vancouver"].includes(contact.city)) {
    return `Owner attested ${attestedAt}: ${note} Address published by recipient at ${contact.sourceUrl}; no opt-out statement; outreach relevant to ${contact.role} at ${contact.company}. Source checked ${contact.sourceCheckedAt}.`.slice(0, 500);
  }
  if (["New York", "Los Angeles"].includes(contact.city)) {
    return `US commercial outreach reviewed ${attestedAt}: ${note} ${contact.role} at ${contact.company}; route ${contact.sourceUrl}; source checked ${contact.sourceCheckedAt}; CAN-SPAM sender, postal address and opt-out requirements apply.`.slice(0, 500);
  }
  throw new Error(`Review the recipient location for ${contact.company} before sending`);
}
