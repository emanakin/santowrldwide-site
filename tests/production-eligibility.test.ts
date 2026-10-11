import assert from "node:assert/strict";
import test from "node:test";
import { attestedOutreachBasis, hasRecordedBasis } from "../src/lib/production/eligibility";

const contact = {
  city: "Toronto", company: "Example Studio", role: "Creative producer",
  sourceUrl: "https://example.com/team", sourceCheckedAt: "2026-10-11", email: "producer@example.com",
};
const sharedBasis = "Reviewed the published route and the relevance of this visual-production pitch.";

test("Canadian batch review records a source-specific owner attestation", () => {
  const basis = attestedOutreachBasis(contact, "2026-10-11T12:00:00Z", sharedBasis);
  assert.match(basis, /Owner attested/);
  assert.match(basis, /example\.com\/team/);
  assert.match(basis, /no opt-out statement/);
  assert.match(basis, /Creative producer/);
  assert.match(basis, /Reviewed the published route/);
  assert.equal(hasRecordedBasis(basis), true);
});

test("US batch review records the applicable commercial outreach route", () => {
  const basis = attestedOutreachBasis({ ...contact, city: "New York" }, "2026-10-11T12:00:00Z", sharedBasis);
  assert.match(basis, /US commercial outreach/);
  assert.match(basis, /CAN-SPAM/);
});

test("batch review rejects a missing source or unknown recipient location", () => {
  assert.throws(() => attestedOutreachBasis({ ...contact, sourceUrl: "" }, "2026-10-11T12:00:00Z", sharedBasis), /Complete the source/);
  assert.throws(() => attestedOutreachBasis({ ...contact, city: "Unknown" }, "2026-10-11T12:00:00Z", sharedBasis), /recipient location/);
  assert.throws(() => attestedOutreachBasis(contact, "2026-10-11T12:00:00Z", "short"), /Write one outreach basis/);
});
