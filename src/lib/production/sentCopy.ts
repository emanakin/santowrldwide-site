import { ImapFlow } from "imapflow";

/** Store an RFC 822 copy in the mailbox's actual Sent folder. This never sends mail. */
export async function appendToSent(raw: Buffer, messageId: string, sentAt: string) {
  const host = process.env.IMAP_HOST || process.env.SMTP_HOST || "mail.privateemail.com";
  const port = Number(process.env.IMAP_PORT || 993);
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASSWORD || process.env.SMTP_PASSWORD;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass) {
    throw new Error("IMAP mailbox settings are incomplete");
  }
  const client = new ImapFlow({ host, port, secure: true, auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000, logger: false });
  try {
    await client.connect();
    const folders = await client.list();
    const sent = folders.find((folder) => folder.specialUse === "\\Sent")
      ?? folders.find((folder) => /^sent(?: items| mail)?$/i.test(folder.name));
    if (!sent) throw new Error("PrivateEmail Sent folder was not found");
    const lock = await client.getMailboxLock(sent.path);
    try {
      const existing = await client.search({ header: { "Message-ID": messageId } });
      if (Array.isArray(existing) && existing.length) return { folder: sent.path, alreadyPresent: true };
      const result = await client.append(sent.path, raw, ["\\Seen"], new Date(sentAt));
      if (!result) throw new Error("IMAP did not confirm the Sent copy");
      return { folder: sent.path, alreadyPresent: false };
    } finally {
      lock.release();
    }
  } finally {
    if (client.usable) await client.logout().catch(() => undefined);
  }
}
