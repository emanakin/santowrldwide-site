import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { ProductionBooking, ProductionBookingSlot } from "@/types/production-types";
import nodemailer from "nodemailer";
import { z } from "zod";

function db() { if (!adminDb) throw new Error("Firebase Admin is not configured"); return adminDb; }
const slots = () => db().collection("production_booking_slots");
const bookings = () => db().collection("production_bookings");
const zone = "America/Toronto";

function torontoParts(utc: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return Object.fromEntries(formatter.formatToParts(utc).map((part) => [part.type, part.value]));
}

export function torontoLocalToUtc(local: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error("Use a Toronto date and time");
  const wanted = local.replace(/\D/g, "");
  const base = Date.parse(local + ":00Z");
  const matches = [-5, -4].map((offset) => new Date(base - offset * 3600_000)).filter((date) => {
    const p = torontoParts(date);
    return `${p.year}${p.month}${p.day}${p.hour}${p.minute}` === wanted;
  });
  if (matches.length !== 1) throw new Error("Time is invalid or ambiguous in Toronto; choose another slot");
  return matches[0].toISOString();
}

export async function addSlot(local: string) {
  const startsAt = torontoLocalToUtc(local);
  if (Date.parse(startsAt) < Date.now() + 3600_000) throw new Error("Choose a slot at least one hour ahead");
  const endsAt = new Date(Date.parse(startsAt) + 20 * 60_000).toISOString();
  const id = String(Date.parse(startsAt));
  const slot: ProductionBookingSlot = { id, startsAt, endsAt, status: "open" };
  await db().runTransaction(async (transaction) => {
    const ref = slots().doc(id);
    const existing = await transaction.get(ref);
    if (existing.exists) throw new Error("That slot already exists");
    transaction.set(ref, slot);
  });
  return slot;
}

export async function listSlots(includeAll = false): Promise<ProductionBookingSlot[]> {
  const snapshot = await slots().orderBy("startsAt").limit(500).get();
  const all = snapshot.docs.map((doc) => doc.data() as ProductionBookingSlot);
  return includeAll ? all : all.filter((slot) => slot.status === "open" && Date.parse(slot.startsAt) > Date.now());
}

export async function cancelSlot(id: string) {
  const ref = slots().doc(id);
  await db().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.status !== "open") throw new Error("Only open slots can be removed");
    transaction.update(ref, { status: "cancelled" });
  });
}

export async function listBookings(): Promise<ProductionBooking[]> {
  const snapshot = await bookings().orderBy("startsAt", "desc").limit(200).get();
  return snapshot.docs.map((doc) => doc.data() as ProductionBooking);
}

const bookingInput = z.object({
  slotId: z.string().regex(/^\d+$/),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  note: z.string().trim().max(500).default(""),
  website: z.string().max(0).optional(),
});

async function sendConfirmation(booking: ProductionBooking) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) return false;
  const port = Number(SMTP_PORT);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
  const date = new Intl.DateTimeFormat("en-US", { timeZone: zone, dateStyle: "full", timeStyle: "short" }).format(new Date(booking.startsAt));
  const text = `hi ${booking.name},\n\nthanks for booking 20 minutes with zeb. we're set for ${date} (toronto time).\n\nif you need to change it, just reply here.\n\nbest,\nzeb`;
  await transport.sendMail({ from: SMTP_FROM, to: booking.email, replyTo: SMTP_USER, subject: "our conversation with santo", text });
  await transport.sendMail({ from: SMTP_FROM, to: SMTP_USER, subject: `new booking: ${booking.name} — ${date}`, text: `${booking.name} <${booking.email}> booked ${date}.\n\n${booking.note}` });
  return true;
}

export async function reserveSlot(raw: unknown) {
  const input = bookingInput.parse(raw);
  const ref = slots().doc(input.slotId);
  const bookingRef = bookings().doc();
  const booking = await db().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.status !== "open" || Date.parse(snapshot.data()!.startsAt) <= Date.now()) throw new Error("This time is no longer available");
    const slot = snapshot.data() as ProductionBookingSlot;
    const value: ProductionBooking = { id: bookingRef.id, slotId: slot.id, startsAt: slot.startsAt, endsAt: slot.endsAt, name: input.name, email: input.email.toLowerCase(), note: input.note, createdAt: new Date().toISOString() };
    transaction.update(ref, { status: "booked", bookingId: bookingRef.id });
    transaction.set(bookingRef, value);
    return value;
  });
  try { await sendConfirmation(booking); } catch (error) {
    await bookingRef.update({ confirmationError: error instanceof Error ? error.message : "Confirmation failed" });
  }
  return booking;
}
