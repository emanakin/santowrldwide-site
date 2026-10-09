export type SubjectContact = {
  id: string;
  name: string;
  company: string;
  city?: string;
};

const GENERIC_NAMES = /^(team|general|hello|contact|info|inquiries|inquiry|hi|there)$/i;

/** First name when it reads like a person. Generic inboxes stay unnamed. */
export function recipientFirstName(name: string): string | null {
  const first = name.trim().split(/\s+/)[0] ?? "";
  if (first.length < 2 || GENERIC_NAMES.test(first)) return null;
  return first;
}

/**
 * Short questions a person would actually type.
 * Named contacts lead with their name. Shared inboxes use the company.
 * The shape rotates so a batch does not read like one swapped template.
 * No fake reply prefixes, no "following up", no excitement punctuation.
 */
const NAME_SHAPES: Array<(name: string, company: string) => string> = [
  (name) => `${name} — looking for a top tier music video?`,
  (name) => `need a top tier music video, ${name}?`,
  (name) => `${name}, looking for a music video?`,
  (name) => `${name} — top tier music video?`,
  (name) => `looking for a top tier visual, ${name}?`,
  (name, company) => `${name}, a top tier video for ${company}?`,
  (name, company) => `${name} at ${company} — a music video?`,
];

const COMPANY_SHAPES: Array<(company: string) => string> = [
  (company) => `looking for a top tier video for ${company}?`,
  (company) => `${company} — a top tier music video?`,
  (company) => `a top tier music video for ${company}?`,
  (company) => `music video for ${company}?`,
  (company) => `${company} — a music video?`,
  (company) => `looking for a music video for ${company}?`,
];

function hash(id: string): number {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) value = (value * 33 + id.charCodeAt(index)) >>> 0;
  return value;
}

function cleanSubject(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Assigns one subject per contact. The same contact always starts from the
 * same line, then walks to the next line if that subject is already used.
 */
export function assignSubjects(contacts: SubjectContact[], reserved: Iterable<string> = []): Map<string, string> {
  const used = new Set([...reserved].map((subject) => subject.trim().toLowerCase()).filter(Boolean));
  const result = new Map<string, string>();

  for (const contact of [...contacts].sort((a, b) => a.id.localeCompare(b.id))) {
    const name = recipientFirstName(contact.name);
    const company = contact.company.trim().replace(/\s+/g, " ").slice(0, 80);
    const city = (contact.city ?? "").trim();
    const candidates: string[] = [];
    if (name) {
      const start = hash(contact.id) % NAME_SHAPES.length;
      for (let attempt = 0; attempt < NAME_SHAPES.length; attempt += 1) {
        candidates.push(NAME_SHAPES[(start + attempt) % NAME_SHAPES.length](name, company));
      }
    }
    const companyStart = hash(`${contact.id}:company`) % COMPANY_SHAPES.length;
    for (let attempt = 0; attempt < COMPANY_SHAPES.length; attempt += 1) {
      candidates.push(COMPANY_SHAPES[(companyStart + attempt) % COMPANY_SHAPES.length](company));
    }
    if (city) candidates.push(`${company} in ${city} — a top tier video?`);
    if (name && city) candidates.push(`${name} — ${company}, ${city}`);

    let chosen = "";
    for (const candidate of candidates) {
      const clean = cleanSubject(candidate);
      if (clean.length < 3 || clean.length > 180) continue;
      if (used.has(clean.toLowerCase())) continue;
      chosen = clean;
      break;
    }

    if (!chosen) {
      const stem = name ? `${name} — looking for a top tier music video` : "looking for a top tier music video";
      const extras = [
        cleanSubject(`${stem} — ${company}`),
        cleanSubject(city ? `${stem} — ${company}, ${city}` : `${stem} — ${company}`),
      ];
      chosen = extras.find((candidate) => !used.has(candidate.toLowerCase())) ?? "";
      let suffix = 2;
      while (!chosen || used.has(chosen.toLowerCase())) {
        chosen = cleanSubject(`${stem} — ${company} ${suffix}`);
        suffix += 1;
      }
    }

    used.add(chosen.toLowerCase());
    result.set(contact.id, chosen);
  }

  return result;
}

/** Zeb's note. Only the greeting changes, and only when the contact is a person. */
export function outreachBody(contact: { name: string }): string {
  const name = recipientFirstName(contact.name);
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `${greeting}

I'm reaching out from santowrldwide. To introduce myself and my work, I shape artist visual identities, direct music videos, and bridge a new age aesthetic with talented artists.

We are interested in opportunities for music video direction and visual production. You can view our selected work at https://santowrldwide.com/productions.

If there is a project where our approach could be useful, I'd love to hear about it.

Best,
Zeb`;
}
