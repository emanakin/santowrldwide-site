"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductionBookingSlot } from "@/types/production-types";
import styles from "./BookingPage.module.css";

const label = (iso: string) => new Intl.DateTimeFormat(undefined, { timeZone: "America/Toronto", weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));

export default function BookingPage() {
  const [slots, setSlots] = useState<ProductionBookingSlot[]>([]);
  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => { fetch("/api/production/booking", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("times unavailable"); return r.json(); }).then((data) => setSlots(data.slots ?? [])).catch(() => setMessage("times are unavailable right now. please email")); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/production/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId: selected, name, email, note, website: "" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not book this time");
      setBooked(true);
      setMessage(`you're booked for ${label(result.booking.startsAt)}. a confirmation will be sent to ${email}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not book this time");
      const data = await fetch("/api/production/booking").then((r) => r.json()).catch(() => ({ slots: [] }));
      setSlots(data.slots ?? []);
    } finally { setBusy(false); }
  }

  return <main className={styles.page}>
    <nav><Link href="/productions">SANTOWRLDWIDE</Link><span>20 MINUTES WITH ZEB</span></nav>
    <section className={styles.content}>
      <p className={styles.kicker}>A CONVERSATION ABOUT WHAT’S NEXT</p>
      <h1>let’s talk.</h1>
      <p>music videos, artist identity, visual direction, or a project you’re putting together. pick a time that works and tell me a little about it.</p>
      {booked ? <p role="status" className={styles.result}>{message}</p> : <form onSubmit={submit}>
        <fieldset><legend>available times · toronto</legend>
          {slots.length ? <div className={styles.slots}>{slots.map((slot) => <label key={slot.id} className={selected === slot.id ? styles.chosen : ""}><input type="radio" name="slot" value={slot.id} checked={selected === slot.id} onChange={() => setSelected(slot.id)} required /><span>{label(slot.startsAt)}</span></label>)}</div> : <p>{message || "no times posted right now. you can reply to the email that brought you here, or reach us at"} <a href="mailto:support@santowrldwide.com">support@santowrldwide.com</a>.</p>}
        </fieldset>
        {slots.length > 0 && <div className={styles.fields}>
          <label>name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} /></label>
          <label>email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} /></label>
          <label>what should we talk about? <span>optional</span><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} /></label>
          <button disabled={busy || !selected}>{busy ? "booking…" : "book 20 minutes ↗"}</button>
        </div>}
      </form>}
      {message && !booked && <p role="alert" className={styles.result}>{message}</p>}
    </section>
    <footer><Link href="/productions">SELECTED WORK ↗</Link><span>TORONTO / EVERYWHERE</span></footer>
  </main>;
}
