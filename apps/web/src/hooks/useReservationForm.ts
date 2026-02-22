import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Reservation } from "@/lib/types";
import type { ReservationFormValues } from "@/lib/schemas";
import { reservationFormSchema } from "@/lib/schemas";
import { formToReservationPayload, reservationToFormValues } from "@/lib/reservationMappers";
import type { ReservationPayload } from "@/services/reservationApi";

type UseReservationFormParams = {
  date: string;
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
      form.reset(reservationToFormValues(reservation));
      setOpen(true);
    },
    [form],
  );

  const onSubmit = form.handleSubmit(
    useCallback(
      async (values: ReservationFormValues) => {
        const payload = formToReservationPayload(values);
        try {
          if (editingId) {
            await update.mutateAsync({ id: editingId, payload });
            toast.success("Reservation updated");
          } else {
            await create.mutateAsync(payload);
            toast.success("Reservation created");
          }
          setOpen(false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to save";
          toast.error(msg);
          form.setError("serviceIds", { type: "manual", message: msg });
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
    try {
      await remove.mutateAsync(editingId);
      toast.success("Reservation removed");
      setDeleteOpen(false);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
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
