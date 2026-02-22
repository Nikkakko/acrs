import { useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReservationDialog } from "@/components/schedule/ReservationDialog";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { ScheduleDnDProvider } from "@/components/schedule/ScheduleDnDProvider";
import { ScheduleTableSkeleton } from "@/components/schedule/ScheduleTableSkeleton";
import { useSchedulePage } from "@/hooks/useSchedulePage";
import { today } from "@/lib/timeUtils";

export function SchedulePage() {
  const [date, setDate] = useState(() => today());

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
    staff,
    services,
    rows,
    slots,
    slotMap,
    draggingReservation,
    handleDragStart,
    handleDragEnd,
    isLoading,
    hasNoStaff,
    create,
    update,
    remove,
  } = useSchedulePage(date);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0">
        <ScheduleHeader date={date} onDateChange={setDate} />
        <div className="mt-4">
          <ScheduleTableSkeleton />
        </div>
      </div>
    );
  }

  if (hasNoStaff) {
    return (
      <div className="flex flex-col gap-0">
        <ScheduleHeader date={date} onDateChange={setDate} />
        <div className="mt-4">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No specialists yet"
            description="Add staff members to start creating reservations."
            action={
              <Button asChild variant="default">
                <Link to="/staff">Go to Staff</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <ScheduleHeader date={date} onDateChange={setDate} />

      <div className="mt-4">
        <ScheduleDnDProvider
          date={date}
          staff={staff}
          slots={slots}
          slotMap={slotMap}
          rows={rows}
          draggingReservation={draggingReservation}
          onSlotClick={openCreate}
          onReservationClick={openEdit}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
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
