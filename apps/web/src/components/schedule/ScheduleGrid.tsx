import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleSlot } from "./ScheduleSlot";
import type { Reservation, Staff } from "@/lib/types";

type ScheduleGridProps = {
  date: string;
  staff: Staff[];
  slots: string[];
  slotMap: Map<string, Reservation | null>;
  rows: Reservation[];
  onSlotClick: (specialistId: string, slot: string) => void;
  onReservationClick: (r: Reservation) => void;
};

export function ScheduleGrid({
  date,
  staff,
  slots,
  slotMap,
  rows,
  onSlotClick,
  onReservationClick,
}: ScheduleGridProps) {
  return (
    <div className="overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <Table className="min-w-[980px]">
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="w-20 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Time
            </TableHead>
            {staff.map(s => (
              <TableHead
                key={s.id}
                className="min-w-[220px] px-4 py-3 text-sm font-medium text-foreground"
              >
                {s.first_name} {s.last_name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map(slot => (
            <TableRow key={slot} className="group">
              <TableCell className="whitespace-nowrap px-4 py-0 text-sm text-muted-foreground">
                {slot}
              </TableCell>
              {staff.map(s => (
                <ScheduleSlot
                  key={`${s.id}-${slot}`}
                  date={date}
                  specialistId={s.id}
                  slot={slot}
                  reservation={slotMap.get(`${s.id}-${slot}`) ?? null}
                  staff={staff}
                  rows={rows}
                  onSlotClick={onSlotClick}
                  onReservationClick={onReservationClick}
                />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
