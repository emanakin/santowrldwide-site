const encoder = new TextEncoder();

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createUnlockToken(secret: string) {
  const expires = String(Date.now() + 60 * 60 * 1000);
  return `${expires}.${await signature(expires, secret)}`;
}

export async function verifyUnlockToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [expires, mac, extra] = token.split(".");
  if (extra || !expires || !mac || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  return mac === await signature(expires, secret);
}
