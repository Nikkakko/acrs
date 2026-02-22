import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { ReservationCardOverlay } from "./ReservationCard";
import { ScheduleGrid } from "./ScheduleGrid";
import type { Reservation, Staff } from "@/lib/types";

type ScheduleDnDProviderProps = {
  date: string;
  staff: Staff[];
  slots: string[];
  slotMap: Map<string, Reservation | null>;
  rows: Reservation[];
  draggingReservation: Reservation | null;
  onSlotClick: (specialistId: number, slot: string) => void;
  onReservationClick: (r: Reservation) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function ScheduleDnDProvider({
  date,
  staff,
  slots,
  slotMap,
  rows,
  draggingReservation,
  onSlotClick,
  onReservationClick,
  onDragStart,
  onDragEnd,
}: ScheduleDnDProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <ScheduleGrid
        date={date}
        staff={staff}
        slots={slots}
        slotMap={slotMap}
        rows={rows}
        onSlotClick={onSlotClick}
        onReservationClick={onReservationClick}
      />
      <DragOverlay>
        {draggingReservation ? (
          <ReservationCardOverlay
            reservation={draggingReservation}
            staff={staff}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
