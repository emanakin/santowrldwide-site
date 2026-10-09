"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { adminFetch } from "@/services/client/adminApi";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import { CONTACT_CATEGORIES, COMPANY_SCALES, ProductionContact, ProductionDraft } from "@/types/production-types";
import styles from "@/styles/account/Production.module.css";

const emptyContact = {
  name: "", role: "", company: "", websiteUrl: "", city: "Toronto", category: "record_label",
  companyScale: "unknown", email: "", contactUrl: "", sourceUrl: "",
  sourceCheckedAt: new Date().toISOString().slice(0, 10), fitNote: "", consentBasis: "", status: "research",
};

type MailStatus = { smtpConfigured: boolean; postalAddressConfigured: boolean; portfolioReady: boolean; canSend: boolean };

export default function ProductionAdminPage() {
  const { checking } = useSuperAdminGuard();
  const [contacts, setContacts] = useState<ProductionContact[]>([]);
  const [drafts, setDrafts] = useState<ProductionDraft[]>([]);
  const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);
  const [tab, setTab] = useState<"contacts" | "drafts">("contacts");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [scale, setScale] = useState("all");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState(emptyContact);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftTrackOpens, setDraftTrackOpens] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [contactData, draftData, configuration] = await Promise.all([
      adminFetch<{ contacts: ProductionContact[] }>("/api/admin/production/contacts"),
      adminFetch<{ drafts: ProductionDraft[] }>("/api/admin/production/drafts"),
      adminFetch<MailStatus>("/api/admin/production/config"),
    ]);
    setContacts(contactData.contacts);
    setDrafts(draftData.drafts);
    setMailStatus(configuration);
  }, []);

  useEffect(() => {
    if (!checking) load().catch((error) => setMessage(error.message));
  }, [checking, load]);

  const visible = useMemo(() => contacts.filter((contact) => {
    const query = search.toLowerCase();
    return (city === "all" || contact.city === city) &&
      (category === "all" || contact.category === category) &&
      (scale === "all" || contact.companyScale === scale) &&
      (status === "all" || contact.status === status) &&
      `${contact.name} ${contact.company} ${contact.role} ${contact.category}`.toLowerCase().includes(query);
  }), [contacts, search, city, category, scale, status]);

  const currentDraft = drafts.find((draft) => draft.id === selectedDraft);
  const currentContact = currentDraft ? contacts.find((contact) => contact.id === currentDraft.contactId) : null;
  const activity = useMemo(() => {
    const result = new Map<string, { sentAt?: string; openedAt?: string; openCount?: number }>();
    for (const draft of drafts) {
      if (!draft.sentAt) continue;
      const previous = result.get(draft.contactId);
      if (!previous?.sentAt || draft.sentAt > previous.sentAt) result.set(draft.contactId, draft);
    }
    return result;
  }, [drafts]);
  const dateLabel = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  function setField(name: keyof typeof emptyContact, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(contact: ProductionContact) {
    setEditingId(contact.id);
    setFormOpen(true);
    setForm(Object.fromEntries(Object.keys(emptyContact).map((field) => [field, String(contact[field as keyof ProductionContact] ?? "")])) as typeof emptyContact);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveContact(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await adminFetch(editingId ? `/api/admin/production/contacts/${editingId}` : "/api/admin/production/contacts", {
        method: editingId ? "PATCH" : "POST", body: JSON.stringify(form),
      });
      setForm(emptyContact);
      setEditingId(null);
      setFormOpen(false);
      await load();
      setMessage("Contact saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function importCsv(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await adminFetch<{ imported: number; errors: { row: number; error: string }[] }>("/api/admin/production/import", {
        method: "POST", body: JSON.stringify({ csv: await file.text() }),
      });
      await load();
      setMessage(`Imported ${result.imported} contacts. ${result.errors.length} rows skipped.${result.errors.length ? ` First issue: row ${result.errors[0].row}: ${result.errors[0].error}` : ""}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed"); }
    finally { setBusy(false); }
  }

  async function preloadContacts() {
    setBusy(true);
    try {
      const result = await adminFetch<{ total: number; imported: number; skipped: number }>("/api/admin/production/preload", { method: "POST" });
      await load();
      setMessage(`Loaded ${result.imported} of ${result.total} researched contacts. ${result.skipped} already existed or need review.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Preload failed"); }
    finally { setBusy(false); }
  }

  async function exportCsv() {
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Sign in required");
      const response = await fetch("/api/admin/production/export", { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Export failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "santo-production-contacts.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Export failed"); }
    finally { setBusy(false); }
  }

  async function createDraft(contactId: string) {
    setBusy(true);
    try {
      const result = await adminFetch<{ draft: ProductionDraft }>("/api/admin/production/drafts", { method: "POST", body: JSON.stringify({ contactId }) });
      await load();
      openDraft(result.draft);
      setTab("drafts");
      setMessage("Draft created. Review before marking ready.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Draft failed"); }
    finally { setBusy(false); }
  }

  function openDraft(draft: ProductionDraft) {
    setSelectedDraft(draft.id);
    setDraftSubject(draft.subject);
    setDraftBody(draft.body);
    setDraftTrackOpens(draft.trackOpens ?? false);
  }

  async function saveDraft(status?: "draft" | "ready") {
    if (!currentDraft) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/production/drafts/${currentDraft.id}`, {
        method: "PATCH", body: JSON.stringify({ subject: draftSubject, body: draftBody, trackOpens: draftTrackOpens, status }),
      });
      await load();
      setMessage(status === "ready" ? "Draft marked ready." : "Draft saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }

  async function sendDraft() {
    if (!currentDraft || !window.confirm(`Send this reviewed email to ${currentDraft.to}?`)) return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/production/drafts/${currentDraft.id}/send`, { method: "POST", body: JSON.stringify({ confirmSend: true }) });
      await load();
      setMessage("Email sent.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Send failed. Check status before retrying."); await load(); }
    finally { setBusy(false); }
  }

  async function verifySmtp() {
    setBusy(true);
    setMessage("");
    try {
      await adminFetch<{ verified: boolean }>("/api/admin/production/config", { method: "POST" });
      setMessage("PrivateEmail SMTP connection and sign-in verified. No message was sent.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "SMTP verification failed"); }
    finally { setBusy(false); }
  }

  if (checking) return <p>Checking access…</p>;

  return <div className={styles.root}>
    <header className={styles.header}>
      <p className={styles.eyebrow}><Link href="/productions">← Public portfolio</Link> / SANTOWRLDWIDE / PRIVATE</p>
      <h1>Outreach pipeline.</h1>
      <p>Agencies and collaborators, reviewed drafts, and a clear record of each email sent through Santo’s domain.</p>
    </header>
    <div className={styles.stats}>
      <div><strong>{contacts.length}</strong><span>contacts</span></div>
      <div><strong>{new Set(contacts.map((contact) => contact.company.toLowerCase())).size}</strong><span>agencies &amp; companies</span></div>
      <div><strong>{drafts.filter((draft) => draft.status === "sent").length}</strong><span>sent</span></div>
      <div><strong>{drafts.filter((draft) => draft.openedAt).length}</strong><span>image loads</span></div>
    </div>
    {mailStatus && <section className={styles.mailStatus} aria-label="Email setup status">
      <div><strong>Email setup</strong><span>{mailStatus.canSend ? "Ready for reviewed sends" : "Complete the remaining steps before sending"}</span></div>
      <ul>
        <li>{mailStatus.smtpConfigured ? "✓" : "○"} PrivateEmail settings</li>
        <li>{mailStatus.postalAddressConfigured ? "✓" : "○"} Sender postal address</li>
        <li>{mailStatus.portfolioReady ? "✓" : "○"} Portfolio approved for outreach</li>
      </ul>
      <button onClick={verifySmtp} disabled={busy || !mailStatus.smtpConfigured}>Check SMTP connection</button>
    </section>}
    {message && <p role="status" className={styles.notice}>{message}</p>}
    <div className={styles.toolbar}>
      <div className={styles.tabs}>
        <button className={tab === "contacts" ? styles.active : ""} onClick={() => setTab("contacts")}>Agency pipeline</button>
        <button className={tab === "drafts" ? styles.active : ""} onClick={() => setTab("drafts")}>Email history &amp; drafts</button>
      </div>
      <div className={styles.actions}>
        <button onClick={preloadContacts} disabled={busy}>Preload 271 researched contacts</button>
        <label className={styles.fileButton}>Import CSV<input type="file" accept=".csv,text/csv" onChange={(event) => { importCsv(event.target.files?.[0]); event.target.value = ""; }} hidden /></label>
        <button onClick={exportCsv} disabled={busy}>Export CSV</button>
      </div>
    </div>
    <p className={styles.hint}>Preload adds the researched snapshot once and skips duplicates. “Sent” means SMTP accepted the message. “Image loaded” is only an email image request; privacy tools can load or block it, so it does not prove a person read the email.</p>

    {tab === "contacts" ? <>
      <details className={styles.editorDetails} open={formOpen} onToggle={(event) => setFormOpen(event.currentTarget.open)}>
      <summary>{editingId ? `Editing ${form.company}` : "+ Add a verified contact"}</summary>
      <form className={styles.form} onSubmit={saveContact}>
        <h2>{editingId ? "Edit contact" : "Add a verified contact"}</h2>
        <div className={styles.formGrid}>
          {(["name", "role", "company", "websiteUrl", "city", "email", "contactUrl", "sourceUrl", "sourceCheckedAt", "fitNote", "consentBasis"] as const).map((field) =>
            <label key={field}><span>{field.replace(/([A-Z])/g, " $1")}</span><input type={field === "sourceCheckedAt" ? "date" : field === "email" ? "email" : "text"} value={form[field]} onChange={(event) => setField(field, event.target.value)} required={["name", "company", "city", "sourceUrl", "sourceCheckedAt"].includes(field)} /></label>
          )}
          <label><span>Category</span><select value={form.category} onChange={(event) => setField("category", event.target.value)}>{CONTACT_CATEGORIES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label><span>Company scale</span><select value={form.companyScale} onChange={(event) => setField("companyScale", event.target.value)}>{COMPANY_SCALES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
          <label><span>Status</span><select value={form.status} onChange={(event) => setField("status", event.target.value)}>{["research", "qualified", "ready", "contacted", "replied", "suppressed"].map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>
        <p className={styles.hint}>Use only a publicly listed professional route. Record why a specific recipient is eligible before sending.</p>
        <button className={styles.primary} disabled={busy}>{editingId ? "Save changes" : "Add contact"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyContact); }}>Cancel</button>}
      </form>
      </details>
      <div className={styles.filters}>
        <input aria-label="Search contacts" placeholder="Search name, company, role…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter by city" value={city} onChange={(event) => setCity(event.target.value)}><option value="all">All cities</option>{[...new Set(contacts.map((contact) => contact.city))].sort().map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{CONTACT_CATEGORIES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
        <select aria-label="Filter by company scale" value={scale} onChange={(event) => setScale(event.target.value)}><option value="all">All scales</option>{COMPANY_SCALES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{["research", "qualified", "ready", "contacted", "replied", "suppressed"].map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className={styles.pipelineHead}><span>Agency / contact</span><span>City / scale</span><span>Stage</span><span>Last sent</span><span>Email image</span><span>Actions</span></div>
      <div className={styles.list}>{visible.map((contact) => {
        const latest = activity.get(contact.id);
        return <article key={contact.id} className={styles.pipelineRow}>
          <div><a className={styles.companyLink} href={contact.websiteUrl || contact.sourceUrl} target="_blank" rel="noreferrer">{contact.company} ↗</a><span>{contact.name} · {contact.role || contact.category.replaceAll("_", " ")}</span></div>
          <div><span>{contact.city}</span><small>{contact.companyScale.replaceAll("_", " ")}</small></div>
          <div><span className={styles.statusChip}>{contact.status}</span></div>
          <div><span>{dateLabel(latest?.sentAt)}</span></div>
          <div><span>{latest?.openedAt ? `Image loaded · ${dateLabel(latest.openedAt)}` : latest?.sentAt ? "No signal" : "—"}</span></div>
          <div className={styles.rowActions}><a href={contact.contactUrl || contact.sourceUrl} target="_blank" rel="noreferrer">Route ↗</a><a href={contact.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a><button onClick={() => startEdit(contact)}>Edit</button>{contact.email && <button onClick={() => createDraft(contact.id)} disabled={busy || contact.status === "suppressed"}>Draft</button>}</div>
        </article>;
      })}</div>
    </> : <div className={styles.draftLayout}>
      <div className={styles.draftList}>{drafts.map((draft) => <button key={draft.id} className={selectedDraft === draft.id ? styles.selected : ""} onClick={() => openDraft(draft)}><strong>{contacts.find((contact) => contact.id === draft.contactId)?.company || draft.to}</strong><span>{draft.status} · {draft.to}</span></button>)}</div>
      <div className={styles.draftEditor}>{currentDraft ? <>
        <p className={styles.eyebrow}>{currentContact?.name} · {currentContact?.company}</p>
        <h2>Review message</h2>
        <p>To: {currentDraft.to} · Status: {currentDraft.status}</p>
        <p>Last sent: {dateLabel(currentDraft.sentAt)} · Email image: {currentDraft.openedAt ? `loaded ${dateLabel(currentDraft.openedAt)} (${currentDraft.openCount || 1} request${currentDraft.openCount === 1 ? "" : "s"})` : "no signal"}</p>
        <label><span>Subject</span><input value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} disabled={!(["draft", "ready"].includes(currentDraft.status))} /></label>
        <label><span>Message</span><textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} rows={16} disabled={!(["draft", "ready"].includes(currentDraft.status))} /></label>
        <label className={styles.checkboxLabel}><input type="checkbox" checked={draftTrackOpens} onChange={(event) => setDraftTrackOpens(event.target.checked)} disabled={!(["draft", "ready"].includes(currentDraft.status))} /><span>Include image-load tracking in this email</span></label>
        <div className={styles.actions}><button onClick={() => saveDraft()} disabled={busy || !(["draft", "ready"].includes(currentDraft.status))}>Save</button><button onClick={() => saveDraft("ready")} disabled={busy || !(["draft", "ready"].includes(currentDraft.status))}>Mark ready</button><button className={styles.primary} onClick={sendDraft} disabled={busy || currentDraft.status !== "ready"}>Send reviewed email</button></div>
        {currentDraft.error && <p className={styles.notice}>{currentDraft.error}</p>}
      </> : <p>Select a draft to review.</p>}</div>
    </div>}
  </div>;
}
