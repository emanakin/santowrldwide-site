export type SubjectContact = { id: string; name: string; company: string; city?: string };
const GENERIC_NAMES = /^(team|general|hello|contact|info|inquiries|inquiry|hi|there)$/i;

export function draftPlaceholders(body: string): string[] {
  return body.match(/\[[^\]\n]+\]/g) ?? [];
}

export function recipientFirstName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.length < 2 || GENERIC_NAMES.test(first) ? null : first;
}

/** Safe fallback for a manually created draft. Research imports carry their own copy. */
export function assignSubjects(contacts: SubjectContact[], reserved: Iterable<string> = []): Map<string, string> {
  const used = new Set([...reserved].map((subject) => subject.toLowerCase()));
  const result = new Map<string, string>();
  for (const contact of [...contacts].sort((a, b) => a.id.localeCompare(b.id))) {
    const company = contact.company.trim().toLowerCase();
    const name = recipientFirstName(contact.name)?.toLowerCase();
    const choices = [
      `could we talk visuals for ${company}?`,
      name ? `${name}, could we talk about visual direction?` : `where could visual direction fit at ${company}?`,
      `would a creative collaboration with ${company} make sense?`,
      `could my work be useful to ${company}?`,
    ];
    const chosen = choices.find((choice) => !used.has(choice)) ?? `could we connect about visuals at ${company}, ${contact.city || "sometime"}?`;
    used.add(chosen);
    result.set(contact.id, chosen);
  }
  return result;
}

export function outreachBody(contact: { name: string; company: string }): string {
  const name = recipientFirstName(contact.name);
  const greeting = name ? `hey ${name.toLowerCase()},` : "hey,";
  return `${greeting}\n\ni'm zeb, founder and creative director of santowrldwide. i direct music videos and shape artist identity through styling and film. i'm reaching out to ${contact.company} because there may be a project where that could be useful.\n\nselected work: https://santowrldwide.com/productions\n\nopen to a quick 20-minute chat? if so, here's a time link: https://santowrldwide.com/book/zeb\n\nbest,\nzeb`;
}
