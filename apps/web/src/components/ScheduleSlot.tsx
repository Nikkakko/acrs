import { useDndContext, useDroppable } from "@dnd-kit/core";
import { TableCell } from "@/components/ui/table";
import { ReservationCard } from "@/components/ReservationCard";
import type { Reservation, Staff } from "@/lib/types";
import { calcEndSlot, isSlotInPast, overlaps, toTime } from "@/lib/timeUtils";

export function getDroppableId(specialistId: number, slot: string) {
  return `slot-${specialistId}-${slot}`;
}

export function parseDroppableId(id: string): { specialistId: number; slot: string } | null {
  const match = id.match(/^slot-(\d+)-(.+)$/);
  if (!match) return null;
  return { specialistId: Number(match[1]), slot: match[2] };
}

type ScheduleSlotProps = {
  date: string;
  specialistId: number;
  slot: string;
  reservation: Reservation | null;
  staff: Staff[];
  rows: Reservation[];
  onSlotClick: (specialistId: number, slot: string) => void;
  onReservationClick: (r: Reservation) => void;
};

export function ScheduleSlot({
  date,
  specialistId,
  slot,
  reservation,
  staff,
  rows,
  onSlotClick,
  onReservationClick,
}: ScheduleSlotProps) {
  const { active } = useDndContext();
  const droppableId = getDroppableId(specialistId, slot);
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  const activeReservation =
    active?.id?.toString().startsWith("reservation-") && active?.data?.current
      ? (active.data.current as { reservation: Reservation }).reservation
      : null;

  const isStart = reservation && toTime(reservation.start_time) === slot;
  const isPast = isSlotInPast(date, slot);

  const isValidDrop =
    activeReservation &&
    !isPast &&
    !reservation &&
    (activeReservation.specialist_id !== specialistId || toTime(activeReservation.start_time) !== slot) &&
    !overlaps(
      rows,
      specialistId,
      slot,
      calcEndSlot(slot, activeReservation.duration_min),
      activeReservation.id,
    );

  const showDropFeedback = isOver && activeReservation && !reservation;
  const dropValid = showDropFeedback ? isValidDrop : null;

  const baseCellClass = `min-w-[220px] py-0 align-top transition-colors ${
    isPast
      ? "cursor-not-allowed bg-muted/30 opacity-75"
      : "cursor-pointer hover:bg-accent"
  }`;

  const dropFeedbackClass =
    dropValid === true
      ? "ring-2 ring-primary/50 bg-primary/10 cursor-move"
      : dropValid === false
        ? "bg-destructive/10 cursor-no-drop"
        : "";

  return (
    <TableCell
      ref={setNodeRef}
      className={`${baseCellClass} ${dropFeedbackClass}`}
      style={{ height: 48 }}
      title={
        isPast && !reservation
          ? "This time has passed. Reservations can only be created for current or future times."
          : undefined
      }
      aria-disabled={isPast && !reservation}
      aria-label={
        isPast && !reservation ? "Past time slot, cannot create reservation" : undefined
      }
      onClick={() => !isPast && !reservation && onSlotClick(specialistId, slot)}
    >
      {isPast && !reservation && (
        <span className="flex h-full min-h-[48px] items-center justify-center text-xs text-muted-foreground">
          Past — cannot create
        </span>
      )}
      {reservation && isStart && (
        <ReservationCard
          reservation={reservation}
          staff={staff}
          onClick={onReservationClick}
        />
      )}
    </TableCell>
  );
}
