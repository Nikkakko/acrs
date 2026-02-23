import { useMemo, useState, useCallback } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import {
  useReservationMutations,
  useReservationsQuery,
} from "@/hooks/useReservations";
import { useServiceFieldsQuery, useServicesQuery } from "@/hooks/useServices";
import { useStaffQuery } from "@/hooks/useStaff";
import { useReservationForm } from "@/hooks/useReservationForm";
import { getErrorMessage } from "@/lib/apiError";
import type { Reservation } from "@/lib/types";
import { findReservationAt, TIME_SLOTS } from "@/lib/timeUtils";
import {
  parseDroppableId,
  parseReservationFromActive,
  isValidReservationDrop,
  buildReservationMovePayload,
} from "@/lib/scheduleDnd";

export function useSchedulePage(date: string) {
  const [draggingReservation, setDraggingReservation] =
    useState<Reservation | null>(null);

  const slots = TIME_SLOTS;
  const { data: staff = [], isPending: staffPending } = useStaffQuery("");
  const { data: services = [], isPending: servicesPending } = useServicesQuery("");
  const { data: orderedFields = [] } = useServiceFieldsQuery();
  const { data: rows = [], isPending: reservationsPending } =
    useReservationsQuery(date);
  const { create, update, remove } = useReservationMutations(date);

  const reservationForm = useReservationForm({
    date,
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

  const handleReservationDrop = useCallback(
    async (id: string, specialistId: string, slot: string) => {
      const reservation = rows.find(r => r.id === id);
      if (!reservation) return;
      const payload = buildReservationMovePayload(
        reservation,
        specialistId,
        slot,
        date,
      );
      try {
        await update.mutateAsync({ id, payload });
        toast.success("Reservation moved");
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to move reservation"));
      }
    },
    [date, rows, update],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const reservation = parseReservationFromActive(event.active);
    if (reservation) setDraggingReservation(reservation);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingReservation(null);
      const { active, over } = event;
      if (!over) return;
      const reservation = parseReservationFromActive(active);
      if (!reservation) return;
      const parsed = parseDroppableId(over.id.toString());
      if (!parsed) return;
      const { specialistId, slot } = parsed;
      const dropResult = isValidReservationDrop(
        date,
        specialistId,
        slot,
        reservation,
        rows,
      );
      if (!dropResult.valid) {
        if (dropResult.error !== "Same slot") {
          toast.error(dropResult.error);
        }
        return;
      }
      handleReservationDrop(reservation.id, specialistId, slot);
    },
    [date, rows, handleReservationDrop],
  );

  const isLoading = staffPending || servicesPending || reservationsPending;
  const hasNoStaff = !staffPending && staff.length === 0;

  return {
    ...reservationForm,
    staff,
    services,
    orderedFields,
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
  };
}
