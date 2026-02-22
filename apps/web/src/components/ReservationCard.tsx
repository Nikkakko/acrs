import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { shortName } from "@/lib/staffUtils";
import type { Reservation, Staff } from "@/lib/types";
import { toTime } from "@/lib/timeUtils";
import { cn } from "@/lib/utils";

type ReservationCardProps = {
  reservation: Reservation;
  staff: Staff[];
  onClick: (r: Reservation) => void;
  /** When true, render a simplified version for DragOverlay (no drag listeners) */
  isOverlay?: boolean;
};

function ReservationCardContent({
  reservation,
  specialist,
  compact,
}: {
  reservation: Reservation;
  specialist: Staff | undefined;
  compact?: boolean;
}) {
  return (
    <CardContent
      className={cn("flex flex-col gap-0.5 px-3 py-2", compact && "py-1.5")}
    >
      <span className="text-sm font-medium">
        {reservation.services[0]?.name ?? "Service"}
      </span>
      {reservation.services.length > 1 && (
        <ul className="list-inside list-disc pl-2 text-xs opacity-90">
          {reservation.services.slice(1).map(s => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}
      <span className="text-xs opacity-90">
        {toTime(reservation.start_time)} – {toTime(reservation.end_time)}
        {specialist ? ` · ${shortName(specialist)}` : ""}
      </span>
    </CardContent>
  );
}

export function ReservationCard({
  reservation,
  staff,
  onClick,
  isOverlay = false,
}: ReservationCardProps) {
  const specialist = staff.find(s => s.id === reservation.specialist_id);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `reservation-${reservation.id}`,
      data: { reservation },
      disabled: isOverlay,
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const card = (
    <Card
      ref={isOverlay ? undefined : setNodeRef}
      role="button"
      tabIndex={0}
      className={cn(
        "cursor-grab border-0 shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing h-full",
        isDragging && !isOverlay && "opacity-40",
      )}
      style={{
        ...style,
        background: reservation.services[0]?.color ?? "var(--primary)",
        color: "rgba(255,255,255,0.95)",
      }}
      onClick={e => {
        if (!isOverlay) {
          e.stopPropagation();
          onClick(reservation);
        }
      }}
      onKeyDown={e => {
        if (!isOverlay && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(reservation);
        }
      }}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      <ReservationCardContent
        reservation={reservation}
        specialist={specialist}
      />
    </Card>
  );

  return card;
}

/** Card for use inside DragOverlay (no drag listeners, just display) */
export function ReservationCardOverlay({
  reservation,
  staff,
}: {
  reservation: Reservation;
  staff: Staff[];
}) {
  const specialist = staff.find(s => s.id === reservation.specialist_id);
  return (
    <Card
      className="cursor-grabbing border-0 shadow-lg rotate-1"
      style={{
        background: reservation.services[0]?.color ?? "var(--primary)",
        color: "rgba(255,255,255,0.95)",
        maxWidth: 200,
      }}
    >
      <ReservationCardContent
        reservation={reservation}
        specialist={specialist}
        compact
      />
    </Card>
  );
}
