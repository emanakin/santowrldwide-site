export const AUTO_APPROVAL_TEXT = "Sender approved outreach to this publicly listed business address.";

export function hasRecordedBasis(value: string | undefined) {
  const basis = value?.trim();
  return Boolean(basis && basis !== AUTO_APPROVAL_TEXT);
}
