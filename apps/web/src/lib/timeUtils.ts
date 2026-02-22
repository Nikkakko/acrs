import { addMinutes, format, parse } from "date-fns";
import type { Reservation } from "./types";

/** ISO date string for today (YYYY-MM-DD) */
export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Format Date to YYYY-MM-DD in local timezone */
export function toDateOnly(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** True if the given date + slot time is in the past (before now) */
export function isSlotInPast(dateStr: string, timeStr: string): boolean {
  const slotStart = parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date());
  return slotStart.getTime() < Date.now();
}

/** Time slots from 08:00 to 20:00 in 30-min increments */
export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h += 1) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 0) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

/** Snap a time string (HH:mm or HH:mm:ss) to the nearest 30-min slot */
export function snapTimeToSlot(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = (h || 0) * 60 + (m || 0);
  const snappedMins = Math.round(totalMins / 30) * 30;
  const hh = Math.floor(snappedMins / 60);
  const mm = snappedMins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Convert local date (YYYY-MM-DD) and time (HH:mm) to ISO string for API */
export function toISOFromLocalDateTime(dateStr: string, timeStr: string): string {
  const [h = "00", m = "00"] = timeStr.split(":");
  const normalizedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  const d = parse(`${dateStr} ${normalizedTime}`, "yyyy-MM-dd HH:mm", new Date());
  return d.toISOString();
}

/** Extract HH:mm from ISO datetime string */
export function toTime(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

/** Convert HH:mm to minutes since midnight */
export function minutesFromTime(v: string): number {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

/** Compute end slot (HH:mm) from start slot and duration in minutes */
export function calcEndSlot(slot: string, durationMin: number): string {
  const [h, m] = slot.split(":").map(Number);
  const base = new Date(2000, 0, 1, h, m);
  const end = addMinutes(base, durationMin);
  return format(end, "HH:mm");
}

/** Find reservation that covers the given specialist and time */
export function findReservationAt(
  reservations: Reservation[],
  specialistId: number,
  time: string,
): Reservation | undefined {
  return reservations.find((r) => {
    if (r.specialist_id !== specialistId) return false;
    const start = minutesFromTime(toTime(r.start_time));
    const end = minutesFromTime(toTime(r.end_time));
    const point = minutesFromTime(time);
    return start <= point && point < end;
  });
}

/** Check if proposed slot overlaps with existing reservations */
export function overlaps(
  rows: Reservation[],
  specialistId: number,
  startTime: string,
  endTime: string,
  ignoreId?: number,
): boolean {
  const startM = minutesFromTime(startTime);
  const endM = minutesFromTime(endTime);
  return rows.some((r) => {
    if (r.specialist_id !== specialistId || r.id === ignoreId) return false;
    const rStart = minutesFromTime(toTime(r.start_time));
    const rEnd = minutesFromTime(toTime(r.end_time));
    return startM < rEnd && endM > rStart;
  });
}
