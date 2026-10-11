import { ProductionBookingSlot } from "@/types/production-types";

const zone = "America/Toronto";
const step = 20 * 60_000;

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

export function buildSlotRange(startLocal: string, endLocal: string, now = Date.now()): ProductionBookingSlot[] {
  if (startLocal.slice(0, 10) !== endLocal.slice(0, 10)) throw new Error("Keep each availability range on one Toronto date");
  if (!["00", "20", "40"].includes(startLocal.slice(-2))) throw new Error("Start a range on :00, :20, or :40");
  const start = Date.parse(torontoLocalToUtc(startLocal));
  const end = Date.parse(torontoLocalToUtc(endLocal));
  if (start < now + 3600_000) throw new Error("Choose a range at least one hour ahead");
  if (end <= start || end - start > 8 * 3600_000 || (end - start) % step !== 0) throw new Error("Choose a range of 20-minute blocks, up to eight hours");
  const created: ProductionBookingSlot[] = [];
  for (let time = start; time < end; time += step) {
    created.push({ id: String(time), startsAt: new Date(time).toISOString(), endsAt: new Date(time + step).toISOString(), status: "open" });
  }
  return created;
}
