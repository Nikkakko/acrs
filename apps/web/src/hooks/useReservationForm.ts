import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Reservation, Staff } from "@/lib/types";
import type { ReservationFormValues } from "@/lib/schemas";
import { reservationFormSchema } from "@/lib/schemas";
import { toISOFromLocalDateTime, toTime } from "@/lib/timeUtils";
import type { ReservationPayload } from "@/services/reservationApi";

type Service = { id: number; name: string; price?: string; color?: string };

type UseReservationFormParams = {
  date: string;
  staff: Staff[];
  services: Service[];
  create: {
    mutateAsync: (payload: ReservationPayload) => Promise<Reservation>;
    isPending: boolean;
  };
  update: {
    mutateAsync: (params: {
      id: number;
      payload: ReservationPayload;
    }) => Promise<Reservation>;
    isPending: boolean;
  };
  remove: {
    mutateAsync: (id: number) => Promise<void>;
    isPending: boolean;
  };
};

export function useReservationForm({
  date,
  staff,
  services,
  create,
  update,
  remove,
}: UseReservationFormParams) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      date,
      specialistId: 0,
      startTime: "09:00",
      durationMin: 30,
      serviceIds: [],
    },
  });

  const openCreate = useCallback(
    (specialistId: number, startTime: string) => {
      setEditingId(null);
      form.reset({
        date,
        specialistId,
        startTime,
        durationMin: 30,
        serviceIds: [],
      });
      setOpen(true);
    },
    [date, form],
  );

  const openEdit = useCallback(
    (reservation: Reservation) => {
      setEditingId(reservation.id);
      form.reset({
        date,
        specialistId: reservation.specialist_id,
        startTime: toTime(reservation.start_time),
        durationMin: reservation.duration_min,
        serviceIds: reservation.services.map((s) => s.id),
      });
      setOpen(true);
    },
    [date, form],
  );

  const onSubmit = form.handleSubmit(
    useCallback(
      async (values: ReservationFormValues) => {
        const payload: ReservationPayload = {
          specialistId: values.specialistId,
          startTime: toISOFromLocalDateTime(values.date, values.startTime),
          durationMin: values.durationMin,
          serviceIds: values.serviceIds,
        };
        try {
          if (editingId) {
            await update.mutateAsync({ id: editingId, payload });
          } else {
            await create.mutateAsync(payload);
          }
          setOpen(false);
        } catch (err) {
          form.setError("serviceIds", {
            type: "manual",
            message:
              err instanceof Error ? err.message : "Failed to save",
          });
        }
      },
      [editingId, create, update, form],
    ),
  );

  const onDeleteClick = useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const onDeleteConfirm = useCallback(async () => {
    if (!editingId) return;
    await remove.mutateAsync(editingId);
    setDeleteOpen(false);
    setOpen(false);
  }, [editingId, remove]);

  return {
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
  };
}
