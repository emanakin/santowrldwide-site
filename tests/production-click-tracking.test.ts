import assert from "node:assert/strict";
import test from "node:test";
import { renderLinksAsHtml, trackedOutreachHref } from "../src/lib/production/emailHtml";

const token = "a".repeat(32);
const base = "https://santowrldwide.com";

test("only Santo portfolio and booking links get tracking redirects", () => {
  assert.equal(trackedOutreachHref(`${base}/productions`, token, base), `${base}/api/production/click/${token}/portfolio`);
  assert.equal(trackedOutreachHref(`${base}/book/zeb`, token, base), `${base}/api/production/click/${token}/booking`);
  for (const url of ["https://other.test/productions", `${base}/productions?next=other`, `${base}/about`, "javascript:alert(1)"]) {
    assert.equal(trackedOutreachHref(url, token, base), url);
  }
  assert.equal(trackedOutreachHref(`${base}/productions`, "bad-token", base), `${base}/productions`);
});

test("email HTML retains readable clickable URLs", () => {
  const text = `work: ${base}/productions\nbook: ${base}/book/zeb`;
  const html = renderLinksAsHtml(text, (url) => trackedOutreachHref(url, token, base));
  assert.match(html, new RegExp(`href="${base}/api/production/click/${token}/portfolio"`));
  assert.match(html, new RegExp(`href="${base}/api/production/click/${token}/booking"`));
  assert.match(html, />https:\/\/santowrldwide.com\/productions<\/a>/);
  assert.match(renderLinksAsHtml(text), /href="https:\/\/santowrldwide.com\/productions"/);
});
