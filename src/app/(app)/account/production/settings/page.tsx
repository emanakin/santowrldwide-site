"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase/client/firebaseApp";
import { adminFetch } from "@/services/client/adminApi";
import { hasRecordedBasis } from "@/lib/production/eligibility";
import { useSuperAdminGuard } from "@/hooks/useSuperAdminGuard";
import { CONTACT_CATEGORIES, COMPANY_SCALES, ProductionBooking, ProductionBookingSlot, ProductionContact, ProductionDraft, ProductionSendBatch } from "@/types/production-types";
import styles from "@/styles/account/Production.module.css";

const emptyContact = {
  name: "", role: "", company: "", websiteUrl: "", city: "Toronto", category: "record_label",
  companyScale: "unknown", email: "", contactUrl: "", sourceUrl: "",
  sourceCheckedAt: new Date().toISOString().slice(0, 10), fitNote: "", consentBasis: "", status: "research",
};

type MailStatus = { smtpConfigured: boolean; postalAddressConfigured: boolean; portfolioReady: boolean; canSend: boolean };

function canQueue(contact: ProductionContact, drafts: ProductionDraft[]) {
  return Boolean(contact.email && contact.status !== "suppressed" && drafts.some((draft) => draft.contactId === contact.id && draft.status === "ready"));
}

function trackingActive(draft: ProductionDraft) {
  return draft.trackOpens === true && Boolean(draft.trackingToken);
}

function messageLinks(body: string) {
  return [...new Set(body.match(/https?:\/\/[^\s<>]+/g) ?? [])].map((value) => value.replace(/[.,;!?]+$/, ""));
}

export default function ProductionAdminPage() {
  const { checking } = useSuperAdminGuard();
  const [contacts, setContacts] = useState<ProductionContact[]>([]);
  const [drafts, setDrafts] = useState<ProductionDraft[]>([]);
  const [batches, setBatches] = useState<ProductionSendBatch[]>([]);
  const [slots, setSlots] = useState<ProductionBookingSlot[]>([]);
  const [bookings, setBookings] = useState<ProductionBooking[]>([]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);
  const [tab, setTab] = useState<"contacts" | "drafts" | "tracking" | "booking">("contacts");
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftFilter, setDraftFilter] = useState<"all" | "draft" | "ready" | "sent" | "issues">("all");
  const [trackingFilter, setTrackingFilter] = useState<"all" | "fetched" | "no_signal" | "off">("all");
  const [reviewSelection, setReviewSelection] = useState<Set<string>>(new Set());
  const [trackImageRequests, setTrackImageRequests] = useState(true);
  const [sharedBasis, setSharedBasis] = useState("");
  const trackingMigrationAttempted = useRef(false);

  const load = useCallback(async () => {
    const [contactData, draftData, configuration, batchData, bookingData] = await Promise.all([
      adminFetch<{ contacts: ProductionContact[] }>("/api/admin/production/contacts"),
      adminFetch<{ drafts: ProductionDraft[] }>("/api/admin/production/drafts"),
      adminFetch<MailStatus>("/api/admin/production/config"),
      adminFetch<{ batches: ProductionSendBatch[] }>("/api/admin/production/batches"),
      adminFetch<{ slots: ProductionBookingSlot[]; bookings: ProductionBooking[] }>("/api/admin/production/booking"),
    ]);
    setContacts(contactData.contacts);
    setDrafts(draftData.drafts);
    setMailStatus(configuration);
    setBatches(batchData.batches);
    setSlots(bookingData.slots);
    setBookings(bookingData.bookings);
  }, []);

  useEffect(() => {
    if (!checking) load().catch((error) => setMessage(error.message));
  }, [checking, load]);

  useEffect(() => {
    if (checking || trackingMigrationAttempted.current || !drafts.some((draft) => ["draft", "ready"].includes(draft.status) && (draft.trackOpens !== true || !draft.trackingToken))) return;
    trackingMigrationAttempted.current = true;
    adminFetch<{ updated: number; alreadyRun: boolean }>("/api/admin/production/drafts/tracking", { method: "POST", body: JSON.stringify({ force: false }) })
      .then(async (result) => { if (result.updated) { await load(); setMessage(`Image tracking enabled on ${result.updated} existing unsent drafts.`); } })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not update draft tracking"));
  }, [checking, drafts, load]);

  const activeBatchId = batches.find((batch) => batch.status === "running" || (batch.status === "paused" && batch.pauseReason === "time_window"))?.id;
  useEffect(() => {
    if (checking || !activeBatchId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const id = activeBatchId;
    async function poll() {
      try {
        const result = await adminFetch<{ batches: ProductionSendBatch[] }>("/api/admin/production/batches");
        if (cancelled) return;
        setBatches(result.batches);
        const current = result.batches.find((batch) => batch.id === id);
        if (current?.status === "paused" && current.pauseReason === "time_window") {
          await adminFetch(`/api/admin/production/batches/${id}`, { method: "POST", body: JSON.stringify({ action: "resume" }) });
        } else if (!current || current.status !== "running") {
          await load();
          if (current?.pauseReason === "error" || current?.pauseReason === "interrupted") setMessage("Batch paused. Review its progress and any uncertain sends before resuming.");
          return;
        }
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "Batch progress could not refresh");
        return;
      }
      if (!cancelled) timer = setTimeout(poll, 4000);
    }
    timer = setTimeout(poll, 4000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [activeBatchId, checking, load]);

  const visible = useMemo(() => contacts.filter((contact) => {
    const query = search.toLowerCase();
    return (city === "all" || contact.city === city) &&
      (category === "all" || contact.category === category) &&
      (scale === "all" || contact.companyScale === scale) &&
      (status === "all" || (status === "draft_ready" ? canQueue(contact, drafts) : contact.status === status)) &&
      `${contact.name} ${contact.company} ${contact.role} ${contact.category}`.toLowerCase().includes(query);
  }), [contacts, drafts, search, city, category, scale, status]);

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
  const visibleEligible = visible.filter((contact) => canQueue(contact, drafts));
  const allVisibleSelected = visibleEligible.length > 0 && visibleEligible.every((contact) => selected.has(contact.id));
  const selectedContacts = useMemo(
    () => contacts.filter((contact) => selected.has(contact.id) && canQueue(contact, drafts)),
    [contacts, selected, drafts],
  );
  const selectedDrafts = selectedContacts.map((contact) => drafts.find((draft) => draft.contactId === contact.id && draft.status === "ready")).filter((draft): draft is ProductionDraft => Boolean(draft));
  const missingBasis = selectedContacts.filter((contact) => !hasRecordedBasis(contact.consentBasis));
  const visibleDrafts = drafts.filter((draft) => draftFilter === "all" || (draftFilter === "issues" ? ["send_unknown", "failed"].includes(draft.status) : draft.status === draftFilter));
  const visibleUnapproved = visibleDrafts.filter((draft) => draft.status === "draft");
  const unsentTrackingOff = drafts.filter((draft) => ["draft", "ready"].includes(draft.status) && !trackingActive(draft));
  const sentTracking = drafts.filter((draft) => draft.status === "sent").sort((a, b) => (b.sentAt || "").localeCompare(a.sentAt || ""));
  const visibleTracking = sentTracking.filter((draft) => trackingFilter === "all" || (trackingFilter === "fetched" ? Boolean(draft.openedAt) : trackingFilter === "no_signal" ? trackingActive(draft) && !draft.openedAt : !trackingActive(draft)));

  function toggleContact(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleEligible.forEach((contact) => next.delete(contact.id));
      else visibleEligible.forEach((contact) => next.add(contact.id));
      return next;
    });
  }

  function selectNextHundred() {
    setSelected(() => {
      const next = new Set<string>();
      for (const contact of visibleEligible) {
        if (next.size >= 100) break;
        next.add(contact.id);
      }
      return next;
    });
  }

  async function sendSelected() {
    if (!selectedDrafts.length || selectedDrafts.length > 100 || !mailStatus?.canSend || sharedBasis.trim().length < 10) return;
    setBusy(true);
    setMessage("");
    try {
      await adminFetch("/api/admin/production/batches", { method: "POST", body: JSON.stringify({ draftIds: selectedDrafts.map((draft) => draft.id), confirmSend: true, sharedBasis: sharedBasis.trim(), trackImageRequests }) });
      await load();
      setSelected(new Set());
      setReviewOpen(false);
      setSharedBasis("");
      setMessage(`Batch of ${selectedDrafts.length} started. Keep this page open for automatic continuation; progress is saved and can be resumed later.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Batch failed");
    } finally {
      setBusy(false);
    }
  }

  async function setPortfolioReady(approved: boolean) {
    if (approved && !window.confirm("Confirm that the public Productions portfolio, credits, media rights, and linked work are approved for outreach.")) return;
    setBusy(true);
    try {
      const configuration = await adminFetch<MailStatus>("/api/admin/production/config", { method: "PATCH", body: JSON.stringify({ approved, confirmReview: true }) });
      setMailStatus(configuration);
      setMessage(approved ? "Portfolio approved for outreach. Contact eligibility still applies to every send." : "Portfolio approval removed; sending is paused.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Approval update failed"); }
    finally { setBusy(false); }
  }

  async function bulkMarkReady() {
    const ids = [...reviewSelection].filter((id) => drafts.some((draft) => draft.id === id && draft.status === "draft"));
    if (!ids.length || !window.confirm(`Mark ${ids.length} selected drafts ready? This confirms you reviewed their copy. Sending remains a separate action.`)) return;
    setBusy(true);
    try {
      const result = await adminFetch<{ updated: number }>("/api/admin/production/drafts/ready", { method: "POST", body: JSON.stringify({ draftIds: ids }) });
      setReviewSelection(new Set());
      await load();
      setMessage(`${result.updated} drafts marked ready. Select up to 100 in Agency pipeline to send a batch.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Bulk approval failed"); }
    finally { setBusy(false); }
  }

  async function enableDraftTracking() {
    setBusy(true);
    try {
      const result = await adminFetch<{ eligible: number; updated: number; alreadyEnabled: number }>("/api/admin/production/drafts/tracking", { method: "POST", body: JSON.stringify({ force: true }) });
      await load();
      setMessage(`Image tracking enabled on ${result.updated} existing unsent drafts. ${result.alreadyEnabled} were already enabled. Sent messages were not changed.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update draft tracking"); }
    finally { setBusy(false); }
  }

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

  async function importDraftCsv(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const result = await adminFetch<{ imported: number; skipped: number; errors: { row: number; error: string }[] }>("/api/admin/production/drafts/import", { method: "POST", body: JSON.stringify({ csv: await file.text() }) });
      await load();
      setTab("drafts");
      setMessage(`Imported ${result.imported} unapproved drafts; ${result.skipped} skipped. ${result.errors[0] ? `First issue: row ${result.errors[0].row}: ${result.errors[0].error}` : ""}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Draft import failed"); }
    finally { setBusy(false); }
  }

  async function batchAction(id: string, action: "pause" | "resume") {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/production/batches/${id}`, { method: "POST", body: JSON.stringify({ action }) });
      await load();
      setMessage(`Batch ${action === "pause" ? "paused" : "resumed"}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Batch update failed"); }
    finally { setBusy(false); }
  }

  async function addBookingSlot(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await adminFetch<{ slots: ProductionBookingSlot[] }>("/api/admin/production/booking", { method: "POST", body: JSON.stringify({ startLocal: rangeStart, endLocal: rangeEnd }) });
      setRangeStart("");
      setRangeEnd("");
      await load();
      setMessage(`${result.slots.length} bookable 20-minute times added.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Slot failed"); }
    finally { setBusy(false); }
  }

  async function removeBookingSlot(id: string) {
    setBusy(true);
    try {
      await adminFetch("/api/admin/production/booking", { method: "DELETE", body: JSON.stringify({ id }) });
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove slot"); }
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
    setDraftTrackOpens(draft.trackOpens ?? true);
  }

  async function saveDraft(status?: "draft" | "ready") {
    if (!currentDraft) return;
    setBusy(true);
    try {
      const result = await adminFetch<{ draft: ProductionDraft }>(`/api/admin/production/drafts/${currentDraft.id}`, {
        method: "PATCH", body: JSON.stringify({ subject: draftSubject, body: draftBody, trackOpens: draftTrackOpens, status }),
      });
      if (status === "ready" && result.draft.status !== "ready") throw new Error("Draft was not marked ready");
      await load();
      setMessage(status === "ready" ? "Draft marked ready." : status === "draft" ? "Draft returned to review." : "Changes saved. Review status preserved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }

  function reviewSingleDraft() {
    if (!currentDraft) return;
    setSelected(new Set([currentDraft.contactId]));
    setTrackImageRequests(draftTrackOpens);
    setReviewOpen(true);
    setTab("contacts");
  }

  async function saveSentCopy() {
    if (!currentDraft || currentDraft.status !== "sent") return;
    setBusy(true);
    try {
      await adminFetch(`/api/admin/production/drafts/${currentDraft.id}/archive`, { method: "POST" });
      await load();
      setMessage("A copy is now in the PrivateEmail Sent folder. The recipient was not emailed again.");
    } catch (error) {
      await load();
      setMessage(error instanceof Error ? error.message : "Sent copy failed. The original send record is unchanged.");
    } finally { setBusy(false); }
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
      <p>Research contacts, review each note, then send only the drafts you mark ready.</p>
    </header>
    <div className={styles.stats}>
      <div><strong>{contacts.length}</strong><span>contacts</span></div>
      <div><strong>{new Set(contacts.map((contact) => contact.company.toLowerCase())).size}</strong><span>agencies &amp; companies</span></div>
      <div><strong>{drafts.filter((draft) => draft.status === "sent").length}</strong><span>sent</span></div>
      <div><strong>{drafts.filter((draft) => draft.openedAt).length}</strong><span>possible opens</span></div>
    </div>
    {mailStatus && <section className={styles.mailStatus} aria-label="Email setup status">
      <div><strong>Email setup</strong><span>{mailStatus.canSend ? "Ready for eligible, reviewed sends" : "Complete the unchecked steps before sending"}</span></div>
      <ul>
        <li>{mailStatus.smtpConfigured ? "Configured" : "Missing"}: PrivateEmail settings</li>
        <li>{mailStatus.postalAddressConfigured ? "Configured" : "Missing"}: sender postal address</li>
        <li>{mailStatus.portfolioReady ? "Approved" : "Awaiting approval"}: public portfolio</li>
      </ul>
      <div className={styles.actions}><button onClick={verifySmtp} disabled={busy || !mailStatus.smtpConfigured}>Check SMTP connection</button><button onClick={() => setPortfolioReady(!mailStatus.portfolioReady)} disabled={busy}>{mailStatus.portfolioReady ? "Pause portfolio approval" : "Approve published portfolio"}</button></div>
    </section>}
    {message && <p role="status" className={styles.notice}>{message}</p>}
    <div className={styles.toolbar}>
      <div className={styles.tabs}>
        <button className={tab === "contacts" ? styles.active : ""} onClick={() => setTab("contacts")}>Agency pipeline</button>
        <button className={tab === "drafts" ? styles.active : ""} onClick={() => setTab("drafts")}>Email history &amp; drafts</button>
        <button className={tab === "tracking" ? styles.active : ""} onClick={() => setTab("tracking")}>Email tracking</button>
        <button className={tab === "booking" ? styles.active : ""} onClick={() => setTab("booking")}>Bookings</button>
      </div>
      <div className={styles.actions}>
        <button onClick={preloadContacts} disabled={busy}>Preload 271 researched contacts</button>
        <label className={styles.fileButton}>Import CSV<input type="file" accept=".csv,text/csv" onChange={(event) => { importCsv(event.target.files?.[0]); event.target.value = ""; }} hidden /></label>
        <label className={styles.fileButton}>Import researched drafts<input type="file" accept=".csv,text/csv" onChange={(event) => { importDraftCsv(event.target.files?.[0]); event.target.value = ""; }} hidden /></label>
        <button onClick={exportCsv} disabled={busy}>Export CSV</button>
      </div>
    </div>
    <p className={styles.hint}>Import preserves existing edits and sent history. Review and mark drafts ready, then select up to 100 for a manual send. The send review records one attestation for any contacts still needing a documented route. “Sent” means SMTP accepted the message; an image request is only an open signal.</p>
    {batches.length > 0 && <section className={styles.batchList} aria-label="Send batches"><h2>Send batches</h2>{batches.slice(0, 5).map((batch) => <div key={batch.id} className={styles.batchRow}><div><strong>{batch.status} · {batch.items.filter((item) => item.status === "sent").length}/{batch.items.length} sent</strong><small>{new Date(batch.createdAt).toLocaleString()}{batch.pauseReason ? ` · ${batch.pauseReason.replaceAll("_", " ")}` : ""}</small><small>{batch.items.filter((item) => item.status === "send_unknown").length} uncertain · {batch.items.filter((item) => item.status === "skipped" || item.status === "failed").length} skipped/failed · {batch.items.filter((item) => item.status === "pending").length} pending</small>{batch.sharedBasis && <small>Outreach basis: {batch.sharedBasis}</small>}{batch.items.filter((item) => item.error).map((item) => <small key={item.draftId}>{item.status}: {item.error}</small>)}</div><div className={styles.actions}>{batch.status === "running" && <button onClick={() => batchAction(batch.id, "pause")} disabled={busy}>Pause</button>}{batch.status === "paused" && batch.items.some((item) => item.status === "pending") && <button onClick={() => batchAction(batch.id, "resume")} disabled={busy}>Resume pending</button>}</div></div>)}</section>}

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
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="draft_ready">Draft ready</option>{["research", "qualified", "ready", "contacted", "replied", "suppressed"].map((value) => <option key={value}>{value}</option>)}</select>
      </div>
      <div className={styles.selectionBar}>
        <span>{selectedContacts.length} selected · {visibleEligible.length} ready drafts in this view</span>
        <div className={styles.actions}>
          <button type="button" onClick={toggleVisible} disabled={busy || !visibleEligible.length}>{allVisibleSelected ? "Clear visible" : "Select all visible"}</button>
          <button type="button" onClick={selectNextHundred} disabled={busy || !visibleEligible.length}>Select next 100</button>
          <button type="button" onClick={() => setReviewOpen(true)} disabled={busy || !selectedContacts.length}>Review &amp; send</button>
        </div>
      </div>
      {reviewOpen && <section className={styles.composer} aria-label="Bulk send review">
        <h2>Start a batch of {selectedDrafts.length} {selectedDrafts.length === 1 ? "email" : "emails"}</h2>
        <p>Review recipients and subjects before sending. One click starts up to 100 reviewed emails; the page continues a timed-out batch while it stays open.</p>
        <ul className={styles.composerList}>
          {selectedDrafts.map((draft) => <li key={draft.id}>
            <strong>{draft.subject}</strong>
            <span>{contacts.find((contact) => contact.id === draft.contactId)?.company}<br />{draft.to}<br /><a href={contacts.find((contact) => contact.id === draft.contactId)?.sourceUrl} target="_blank" rel="noreferrer">Contact source ↗</a></span>
          </li>)}
        </ul>
        {selectedDrafts.length > 100 && <p className={styles.hint}>Select at most 100 in one send.</p>}
        <label><span>Outreach basis for this batch</span><textarea value={sharedBasis} onChange={(event) => setSharedBasis(event.target.value)} rows={3} maxLength={300} placeholder="e.g. reviewed each linked company contact page; the address is published without a no-solicitation notice and this visual-production pitch fits the recipient's role" /></label>
        <p className={styles.hint}>One note is saved with this batch and added to {missingBasis.length} selected {missingBasis.length === 1 ? "contact" : "contacts"} without a recorded basis. Check each linked source first. For Canadian recipients, confirm publication by the recipient, no objection to outreach, and relevance to their role.</p>
        <label className={styles.checkboxLabel}><input type="checkbox" checked={trackImageRequests} onChange={(event) => setTrackImageRequests(event.target.checked)} /><span>Include a first-party image request signal in these emails. It cannot prove a person read them.</span></label>
        {!mailStatus?.canSend && <p className={styles.hint}>{!mailStatus?.portfolioReady ? "Approve the public portfolio in Email setup above. " : ""}{!mailStatus?.smtpConfigured ? "Configure PrivateEmail SMTP. " : ""}{!mailStatus?.postalAddressConfigured ? "Add a sender postal address. " : ""}</p>}
        <div className={styles.actions}>
          <button type="button" onClick={() => setReviewOpen(false)} disabled={busy}>Back</button>
          <button type="button" className={styles.primary} onClick={sendSelected} disabled={busy || !mailStatus?.canSend || !selectedDrafts.length || selectedDrafts.length > 100 || sharedBasis.trim().length < 10}>Send {selectedDrafts.length} reviewed {selectedDrafts.length === 1 ? "email" : "emails"}</button>
        </div>
      </section>}
      <div className={styles.pipelineHead}>
        <span className={styles.checkCell}><input type="checkbox" aria-label="Select all visible contacts" checked={allVisibleSelected} onChange={toggleVisible} disabled={!visibleEligible.length} /></span>
        <span>Agency / contact</span><span>City / scale</span><span>Stage</span><span>Last sent</span><span>Image request</span><span>Actions</span>
      </div>
      <div className={styles.list}>{visible.map((contact) => {
        const latest = activity.get(contact.id);
        const queueable = canQueue(contact, drafts);
        return <article key={contact.id} className={styles.pipelineRow} data-selected={queueable && selected.has(contact.id) ? "true" : "false"}>
          <div className={styles.checkCell}><input type="checkbox" aria-label={`Select ${contact.company}`} checked={queueable && selected.has(contact.id)} disabled={!queueable || busy} onChange={() => toggleContact(contact.id)} /></div>
          <div><a className={styles.companyLink} href={contact.websiteUrl || contact.sourceUrl} target="_blank" rel="noreferrer">{contact.company} ↗</a><span>{contact.name} · {contact.role || contact.category.replaceAll("_", " ")}</span>{selected.has(contact.id) && <small>{drafts.find((draft) => draft.contactId === contact.id && draft.status === "ready")?.subject}</small>}</div>
          <div><span>{contact.city}</span><small>{contact.companyScale.replaceAll("_", " ")}</small></div>
          <div><span className={styles.statusChip}>{queueable ? "Draft ready" : contact.status}</span>{queueable && !hasRecordedBasis(contact.consentBasis) && <small>Route review at send</small>}</div>
          <div><span>{dateLabel(latest?.sentAt)}</span></div>
          <div><span>{latest?.openedAt ? `Image fetched · ${dateLabel(latest.openedAt)}` : latest?.sentAt ? "No image signal" : "—"}</span></div>
          <div className={styles.rowActions}><a href={contact.contactUrl || contact.sourceUrl} target="_blank" rel="noreferrer">Route ↗</a><a href={contact.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a><button onClick={() => startEdit(contact)}>Edit</button>{contact.email && !drafts.some((draft) => draft.contactId === contact.id) && <button onClick={() => createDraft(contact.id)} disabled={busy || contact.status === "suppressed"}>Draft</button>}</div>
        </article>;
      })}</div>
    </> : tab === "drafts" ? <div className={styles.draftLayout}>
      <div><div className={styles.draftControls}><select aria-label="Filter drafts" value={draftFilter} onChange={(event) => setDraftFilter(event.target.value as typeof draftFilter)}><option value="all">All drafts ({drafts.length})</option><option value="draft">Needs review ({drafts.filter((draft) => draft.status === "draft").length})</option><option value="ready">Ready ({drafts.filter((draft) => draft.status === "ready").length})</option><option value="sent">Sent history ({drafts.filter((draft) => draft.status === "sent").length})</option><option value="issues">Send issues ({drafts.filter((draft) => ["send_unknown", "failed"].includes(draft.status)).length})</option></select><label className={styles.checkboxLabel}><input type="checkbox" checked={visibleUnapproved.length > 0 && visibleUnapproved.every((draft) => reviewSelection.has(draft.id))} onChange={(event) => setReviewSelection((current) => { const next = new Set(current); visibleUnapproved.forEach((draft) => event.target.checked ? next.add(draft.id) : next.delete(draft.id)); return next; })} disabled={!visibleUnapproved.length || busy} /><span>Select visible unapproved</span></label><button type="button" onClick={bulkMarkReady} disabled={busy || ![...reviewSelection].some((id) => drafts.some((draft) => draft.id === id && draft.status === "draft"))}>Mark {reviewSelection.size} ready</button></div>
      <div className={styles.draftList}>{visibleDrafts.map((draft) => <div key={draft.id} className={styles.draftListRow}>{draft.status === "draft" && <input type="checkbox" aria-label={`Select draft for ${draft.to}`} checked={reviewSelection.has(draft.id)} onChange={(event) => setReviewSelection((current) => { const next = new Set(current); if (event.target.checked) next.add(draft.id); else next.delete(draft.id); return next; })} />}<button className={selectedDraft === draft.id ? styles.selected : ""} onClick={() => openDraft(draft)}><strong>{contacts.find((contact) => contact.id === draft.contactId)?.company || draft.to}</strong><span>{draft.subject}</span><span>{draft.status} · {draft.to}{draft.sentAt ? ` · ${new Date(draft.sentAt).toLocaleString()}` : ""}{draft.status === "sent" ? ` · Sent folder: ${draft.sentCopyStatus === "saved" ? "saved" : draft.sentCopyStatus === "saving" ? "saving" : "needs copy"}` : ""}</span></button></div>)}</div></div>
      <div className={styles.draftEditor}>{currentDraft ? <>
        <p className={styles.eyebrow}>{currentContact?.name} · {currentContact?.company}</p>
        <h2>Review message</h2>
        <p>To: {currentDraft.to} · Status: {currentDraft.status}</p>
        <p>Last sent: {currentDraft.sentAt ? new Date(currentDraft.sentAt).toLocaleString() : "Never"} · Image signal: {currentDraft.openedAt ? `first fetched ${new Date(currentDraft.openedAt).toLocaleString()}, last fetched ${new Date(currentDraft.lastOpenedAt || currentDraft.openedAt).toLocaleString()} (${currentDraft.openCount || 1} requests)` : "none"}</p>
        {currentDraft.providerMessageId && <p>SMTP message ID: <code>{currentDraft.providerMessageId}</code></p>}
        {currentDraft.status === "sent" && <p>PrivateEmail Sent folder: {currentDraft.sentCopyStatus === "saved" ? "copy saved" : currentDraft.sentCopyStatus === "saving" ? "saving copy" : "copy missing or unconfirmed"}. This is separate from SMTP acceptance.</p>}
        {currentDraft.status === "sent" && currentDraft.sentCopyStatus !== "saved" && <div className={styles.actions}><button type="button" onClick={saveSentCopy} disabled={busy || currentDraft.sentCopyStatus === "saving"}>Save copy to PrivateEmail Sent</button><span className={styles.hint}>For older sends, this rebuilds a mailbox copy from the saved draft. It does not resend to the recipient.</span></div>}
        {currentDraft.sentCopyError && <p className={styles.notice}>Sent copy issue: {currentDraft.sentCopyError}</p>}
        {currentDraft.pitchAngle && <div className={styles.evidence}><strong>Research angle</strong><p>{currentDraft.pitchAngle}</p><small>{currentDraft.pitchEvidence}</small>{currentDraft.pitchSourceUrl && <a href={currentDraft.pitchSourceUrl} target="_blank" rel="noreferrer">Verify source ↗</a>}</div>}
        <label><span>Subject</span><input value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} disabled={!(["draft", "ready"].includes(currentDraft.status))} /></label>
        <label><span>Message</span><textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} rows={16} disabled={!(["draft", "ready"].includes(currentDraft.status))} /></label>
        <div className={styles.messageLinks}><strong>Links in this message</strong>{messageLinks(draftBody).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}</div>
        <label className={styles.checkboxLabel}><input type="checkbox" checked={draftTrackOpens} onChange={(event) => setDraftTrackOpens(event.target.checked)} disabled={!(["draft", "ready"].includes(currentDraft.status))} /><span>Include first-party image-request tracking</span></label>
        <p className={styles.hint}>Some email apps block images or fetch them automatically. This signal cannot confirm a person opened or read the message.</p>
        <div className={styles.actions}><button onClick={() => saveDraft()} disabled={busy || !(["draft", "ready"].includes(currentDraft.status))}>Save changes</button>{currentDraft.status === "ready" && <button onClick={() => saveDraft("draft")} disabled={busy}>Move back to draft</button>}<button onClick={() => saveDraft("ready")} disabled={busy || !(["draft", "ready"].includes(currentDraft.status))}>Mark ready</button><button className={styles.primary} onClick={reviewSingleDraft} disabled={busy || currentDraft.status !== "ready" || !mailStatus?.canSend || !currentContact}>Review send</button></div>
        {currentDraft.error && <p className={styles.notice}>{currentDraft.error}</p>}
      </> : <p>Select a draft to review.</p>}</div>
    </div> : null}
    {tab === "tracking" && <section className={styles.trackingPanel} aria-label="Email tracking">
      <div className={styles.trackingIntro}><div><p className={styles.eyebrow}>Outreach / signals</p><h2>Email tracking</h2><p>Image fetches show possible opens, not confirmed reads. Mail apps may prefetch or block the image. Replies and bookings are stronger signals.</p></div><button type="button" onClick={enableDraftTracking} disabled={busy || !unsentTrackingOff.length}>Enable tracking on {unsentTrackingOff.length} unsent {unsentTrackingOff.length === 1 ? "draft" : "drafts"}</button></div>
      <div className={styles.trackingStats}>
        <div><strong>{drafts.filter((draft) => ["draft", "ready"].includes(draft.status) && trackingActive(draft)).length}</strong><span>unsent with tracking</span></div>
        <div><strong>{sentTracking.filter(trackingActive).length}</strong><span>sent with tracking</span></div>
        <div><strong>{sentTracking.filter((draft) => draft.openedAt).length}</strong><span>possible opens</span></div>
        <div><strong>{sentTracking.filter((draft) => !trackingActive(draft)).length}</strong><span>sent without tracking</span></div>
      </div>
      <div className={styles.trackingControls}>
        <h3>Sent messages</h3>
        <select aria-label="Filter email tracking" value={trackingFilter} onChange={(event) => setTrackingFilter(event.target.value as typeof trackingFilter)}>
          <option value="all">All sent ({sentTracking.length})</option>
          <option value="fetched">Image fetched ({sentTracking.filter((draft) => draft.openedAt).length})</option>
          <option value="no_signal">No image signal ({sentTracking.filter((draft) => trackingActive(draft) && !draft.openedAt).length})</option>
          <option value="off">Tracking off ({sentTracking.filter((draft) => !trackingActive(draft)).length})</option>
        </select>
      </div>
      <div className={styles.trackingList}>{visibleTracking.length ? visibleTracking.map((draft) => {
        const contact = contacts.find((item) => item.id === draft.contactId);
        return <article key={draft.id} className={styles.trackingRow}>
          <div><strong>{contact?.company || draft.to}</strong><span>{draft.subject}</span><small>{draft.to}</small></div>
          <div><span>Sent {draft.sentAt ? new Date(draft.sentAt).toLocaleString() : "date unavailable"}</span><strong>{draft.openedAt ? "Possible open" : trackingActive(draft) ? "No image signal" : "Tracking off"}</strong>{draft.openedAt && <small>First fetch {new Date(draft.openedAt).toLocaleString()} · Last fetch {new Date(draft.lastOpenedAt || draft.openedAt).toLocaleString()} · {draft.openCount || 1} {draft.openCount === 1 ? "request" : "requests"}</small>}</div>
          <button type="button" onClick={() => { openDraft(draft); setTab("drafts"); }}>View email</button>
        </article>;
      }) : <p className={styles.hint}>No sent messages match this filter.</p>}</div>
      <p className={styles.hint}>A pixel can be added only before sending. This update leaves previously sent messages and their history unchanged.</p>
    </section>}
    {tab === "booking" && <section className={styles.bookingPanel}>
      <h2>Booking availability</h2><p>Choose a Toronto time range. Guests will see each 20-minute opening within it. We follow up directly after they book. <a href="/book/zeb" target="_blank" rel="noreferrer">Open booking page</a></p>
      <form onSubmit={addBookingSlot} className={styles.rangeForm}><label>Range starts<input type="datetime-local" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} step={1200} required /></label><label>Range ends<input type="datetime-local" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} step={1200} required /></label><button className={styles.primary} disabled={busy}>Add bookable times</button></form>
      <p className={styles.hint}>Use one date, with times on :00, :20, or :40. Range length must be a multiple of 20 minutes, up to eight hours.</p>
      <h3>Slots</h3>{slots.length ? slots.map((slot) => <div className={styles.bookingRow} key={slot.id}><span>{new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(slot.startsAt))} ET · {slot.status}</span>{slot.status === "open" && <button onClick={() => removeBookingSlot(slot.id)} disabled={busy}>Remove</button>}</div>) : <p>No slots yet.</p>}
      <h3>Booked conversations</h3>{bookings.length ? bookings.map((booking) => <div className={styles.bookingRow} key={booking.id}><span>{new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(booking.startsAt))} ET · {booking.name} · <a href={`mailto:${booking.email}`}>{booking.email}</a>{booking.note && <> · {booking.note}</>}{booking.confirmationError && <small> · Confirmation needs manual follow-up</small>}</span></div>) : <p>No bookings yet.</p>}
    </section>}
  </div>;
}
