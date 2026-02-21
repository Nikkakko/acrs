import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { TableCell } from "@/components/ui/table";
import { shortName } from "@/lib/staffUtils";
import type { Reservation, Staff } from "@/lib/types";
import { toTime } from "@/lib/timeUtils";

type ScheduleSlotProps = {
  specialistId: number;
  slot: string;
  reservation: Reservation | null;
  staff: Staff[];
  onSlotClick: (specialistId: number, slot: string) => void;
  onReservationClick: (r: Reservation) => void;
};

export function ScheduleSlot({
  specialistId,
  slot,
  reservation,
  staff,
  onSlotClick,
  onReservationClick,
}: ScheduleSlotProps) {
  const isStart = reservation && toTime(reservation.start_time) === slot;
  const specialist = reservation
    ? staff.find((s) => s.id === reservation.specialist_id)
    : null;

  return (
    <TableCell
      className="min-w-[220px] cursor-pointer py-0 align-top transition-colors hover:bg-accent"
      style={{ height: 48 }}
      onClick={() => !reservation && onSlotClick(specialistId, slot)}
    >
      {reservation && isStart && (
        <Card
          role="button"
          tabIndex={0}
          className="cursor-pointer border-0 shadow-md transition-shadow hover:shadow-lg"
          style={{
            background: reservation.services[0]?.color ?? "var(--primary)",
            color: "rgba(255,255,255,0.95)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onReservationClick(reservation);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onReservationClick(reservation);
            }
          }}
        >
          <CardContent className="flex flex-col gap-0.5 px-3 py-2">
            <span className="text-sm font-medium">
              {reservation.services[0]?.name ?? "Service"}
            </span>
            {reservation.services.length > 1 && (
              <ul className="list-inside list-disc pl-2 text-xs opacity-90">
                {reservation.services.slice(1).map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            )}
            <span className="text-xs opacity-90">
              {toTime(reservation.start_time)} – {toTime(reservation.end_time)}
              {specialist ? ` · ${shortName(specialist)}` : ""}
            </span>
          </CardContent>
        </Card>
      )}
    </TableCell>
  );
}
