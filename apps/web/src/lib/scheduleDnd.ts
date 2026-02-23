import type { Active } from "@dnd-kit/core";
import type { Reservation } from "@/lib/types";
import {
  calcEndSlot,
  isSlotInPast,
  overlaps,
  toISOFromLocalDateTime,
  toTime,
} from "@/lib/timeUtils";

export function getDroppableId(specialistId: string, slot: string): string {
  return `slot-${specialistId}-${slot}`;
}

export function parseDroppableId(
  id: string,
): { specialistId: string; slot: string } | null {
  const match = id.match(/^slot-(.+?)-(.+)$/);
  if (!match) return null;
  return { specialistId: match[1], slot: match[2] };
}

export function parseReservationFromActive(
  active: Active | null,
): Reservation | null {
  if (!active?.id?.toString().startsWith("reservation-") || !active?.data?.current) {
    return null;
  }
  const reservation = (active.data.current as { reservation?: Reservation })
    ?.reservation;
  return reservation ?? null;
}

export type ReservationDropResult =
  | { valid: true }
  | { valid: false; error: string };

export function isValidReservationDrop(
  date: string,
  specialistId: string,
  slot: string,
  reservation: Reservation,
  rows: Reservation[],
): ReservationDropResult {
  if (
    reservation.specialist_id === specialistId &&
    toTime(reservation.start_time) === slot
  ) {
    return { valid: false, error: "Same slot" };
  }
  if (isSlotInPast(date, slot)) {
    return { valid: false, error: "Cannot move reservation to a past time slot" };
  }
  if (
    overlaps(
      rows,
      specialistId,
      slot,
      calcEndSlot(slot, reservation.duration_min),
      reservation.id,
    )
  ) {
    return {
      valid: false,
      error: "Time slot overlaps with an existing reservation",
    };
  }
  return { valid: true };
}

export function buildReservationMovePayload(
  reservation: Reservation,
  specialistId: string,
  slot: string,
  date: string,
) {
  return {
    specialistId,
    startTime: toISOFromLocalDateTime(date, slot),
    durationMin: reservation.duration_min,
    serviceIds: reservation.services.map(s => s.id),
  };
}
