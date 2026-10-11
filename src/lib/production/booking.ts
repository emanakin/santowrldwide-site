import { adminDb } from "@/lib/firebase/admin/firebaseAdmin";
import { ProductionBooking, ProductionBookingSlot } from "@/types/production-types";
import { buildSlotRange } from "@/lib/production/bookingTime";
import nodemailer from "nodemailer";
import { z } from "zod";

function db() { if (!adminDb) throw new Error("Firebase Admin is not configured"); return adminDb; }
const slots = () => db().collection("production_booking_slots");
const bookings = () => db().collection("production_bookings");
const zone = "America/Toronto";

export async function addSlotRange(startLocal: string, endLocal: string) {
  const created = buildSlotRange(startLocal, endLocal);
  await db().runTransaction(async (transaction) => {
    const refs = created.map((slot) => slots().doc(slot.id));
    const existing = await Promise.all(refs.map((ref) => transaction.get(ref)));
    if (existing.some((snapshot) => snapshot.exists)) throw new Error("This range overlaps an existing slot");
    created.forEach((slot, index) => transaction.set(refs[index], slot));
  });
  return created;
}

export async function listSlots(includeAll = false): Promise<ProductionBookingSlot[]> {
  const snapshot = includeAll
    ? await slots().orderBy("startsAt", "desc").limit(500).get()
    : await slots().where("startsAt", ">", new Date().toISOString()).orderBy("startsAt").limit(500).get();
  const all = snapshot.docs.map((doc) => doc.data() as ProductionBookingSlot);
  return includeAll ? all : all.filter((slot) => slot.status === "open");
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
  const text = `hi ${booking.name},\n\nthanks for booking a 20-minute studio call. we're set for ${date} (toronto time). we'll follow up directly.\n\nif you need to change it, just reply here.\n\nbest,\nzeb`;
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
  try {
    if (!await sendConfirmation(booking)) throw new Error("SMTP is not configured");
  } catch (error) {
    booking.confirmationError = error instanceof Error ? error.message : "Confirmation failed";
    await bookingRef.update({ confirmationError: booking.confirmationError });
  }
  return booking;
}
