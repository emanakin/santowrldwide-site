import assert from "node:assert/strict";
import test from "node:test";
import { draftPlaceholders, matchingReviewedDraft } from "../src/lib/production/message";

test("detects old template instructions before a draft is marked ready or sent", () => {
  const body = "Hello,\n\n[Add Santo's approved positioning and a specific, verified reason for contacting 604 Records.]\n\nSelected work: https://santowrldwide.com/productions";
  assert.deepEqual(draftPlaceholders(body), ["[Add Santo's approved positioning and a specific, verified reason for contacting 604 Records.]"]);
});

test("allows finished outreach copy", () => {
  const body = "hey,\n\ni'm zeb from santowrldwide. i thought your artist roster and our video direction might fit.\n\nselected work: https://santowrldwide.com/productions\n\nbest,\nzeb";
  assert.deepEqual(draftPlaceholders(body), []);
});

test("repairs an imported contact when Firestore assigned a different ID", () => {
  const row = { contactId: "csv-id", company: "604 Records", email: "info@604records.com" };
  assert.equal(matchingReviewedDraft([row], { id: "live-id", company: "604 Records", email: "info@604records.com" }, "info@604records.com"), row);
  assert.equal(matchingReviewedDraft([row], { id: "live-id", company: "Other Records", email: "info@604records.com" }, "info@604records.com"), undefined);
  assert.equal(matchingReviewedDraft([row], { id: "live-id", company: "604 Records", email: "different@example.com" }, "info@604records.com"), undefined);
});
