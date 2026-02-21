import { useMemo, useState } from "react";
import { DateNavigator } from "@/components/DateNavigator";
import { ReservationDialog } from "@/components/ReservationDialog";
import { ScheduleSlot } from "@/components/ScheduleSlot";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReservationMutations,
  useReservationsQuery,
} from "@/hooks/useReservations";
import { useServicesQuery } from "@/hooks/useServices";
import { useStaffQuery } from "@/hooks/useStaff";
import { useReservationForm } from "@/hooks/useReservationForm";
import type { Reservation } from "@/lib/types";
import { findReservationAt, timeSlots, today } from "@/lib/timeUtils";

export function SchedulePage() {
  const [date, setDate] = useState(() => today());

  const slots = useMemo(() => timeSlots(), []);

  const { data: staff = [] } = useStaffQuery("");
  const { data: services = [] } = useServicesQuery("");
  const { data: rows = [] } = useReservationsQuery(date);
  const { create, update, remove } = useReservationMutations(date);

  const {
    form,
    editingId,
    open,
    setOpen,
    deleteOpen,
    setDeleteOpen,
    openCreate,
    openEdit,
    onSubmit,
    onDeleteClick,
    onDeleteConfirm,
  } = useReservationForm({
    date,
    staff,
    services,
    create,
    update,
    remove,
  });

  const slotMap = useMemo(() => {
    const m = new Map<string, Reservation | null>();
    for (const s of staff) {
      for (const slot of slots) {
        m.set(`${s.id}-${slot}`, findReservationAt(rows, s.id, slot) ?? null);
      }
    }
    return m;
  }, [staff, slots, rows]);

  return (
    <div className="flex flex-col gap-0">
      {/* Material-style top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-0 pb-4">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Schedule
        </h1>
        <DateNavigator date={date} onDateChange={setDate} />
      </div>

      <div className="mt-4">
        <div className="overflow-auto rounded-lg border border-border bg-card shadow-sm">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="w-20 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time
                </TableHead>
                {staff.map((s) => (
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
              {slots.map((slot) => (
                <TableRow key={slot} className="group">
                  <TableCell className="whitespace-nowrap px-4 py-0 text-sm text-muted-foreground">
                    {slot}
                  </TableCell>
                  {staff.map((s) => (
                    <ScheduleSlot
                      key={`${s.id}-${slot}`}
                      date={date}
                      specialistId={s.id}
                      slot={slot}
                      reservation={slotMap.get(`${s.id}-${slot}`) ?? null}
                      staff={staff}
                      onSlotClick={openCreate}
                      onReservationClick={openEdit}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ReservationDialog
        open={open}
        onOpenChange={setOpen}
        editingId={editingId}
        form={form}
        onSubmit={onSubmit}
        onDeleteClick={onDeleteClick}
        onDeleteConfirm={onDeleteConfirm}
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
        staff={staff}
        services={services}
        createPending={create.isPending}
        updatePending={update.isPending}
        removePending={remove.isPending}
      />
    </div>
  );
}
