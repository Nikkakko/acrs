import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Reservation } from "@/lib/types";
import type { ReservationFormValues } from "@/lib/schemas";
import { reservationFormSchema } from "@/lib/schemas";
import {
  formToReservationPayload,
  reservationToFormValues,
} from "@/lib/reservationMappers";
import type { ReservationPayload } from "@/services/reservationApi";
import { getErrorMessage } from "@/lib/apiError";

type UseReservationFormParams = {
  date: string;
  create: {
    mutateAsync: (payload: ReservationPayload) => Promise<Reservation>;
    isPending: boolean;
  };
  update: {
    mutateAsync: (params: {
      id: string;
      payload: ReservationPayload;
    }) => Promise<Reservation>;
    isPending: boolean;
  };
  remove: {
    mutateAsync: (id: string) => Promise<void>;
    isPending: boolean;
  };
};

export type ReservationModalState =
  | { kind: "closed" }
  | {
      kind: "form";
      editingId: string | null;
      deleteConfirmOpen?: boolean;
    };

export function useReservationForm({
  date,
  create,
  update,
  remove,
}: UseReservationFormParams) {
  const [modalState, setModalState] = useState<ReservationModalState>({
    kind: "closed",
  });

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      date,
      specialistId: "",
      startTime: "09:00",
      durationMin: 30,
      serviceIds: [],
    },
  });

  const openCreate = useCallback(
    (specialistId: string, startTime: string) => {
      form.reset({
        date,
        specialistId,
        startTime,
        durationMin: 30,
        serviceIds: [],
      });
      setModalState({ kind: "form", editingId: null });
    },
    [date, form],
  );

  const openEdit = useCallback(
    (reservation: Reservation) => {
      form.reset(reservationToFormValues(reservation));
      setModalState({ kind: "form", editingId: reservation.id });
    },
    [form],
  );

  const editingId = modalState.kind === "form" ? modalState.editingId : null;

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
          setModalState({ kind: "closed" });
        } catch (err) {
          const msg = getErrorMessage(err, "Failed to save");
          toast.error(msg);
          form.setError("serviceIds", { type: "manual", message: msg });
        }
      },
      [editingId, create, update, form],
    ),
  );

  const onDeleteClick = useCallback(() => {
    if (modalState.kind === "form" && modalState.editingId !== null) {
      setModalState({
        ...modalState,
        deleteConfirmOpen: true,
      });
    }
  }, [modalState]);

  const onDeleteConfirm = useCallback(async () => {
    if (editingId === null) return;
    try {
      await remove.mutateAsync(editingId);
      toast.success("Reservation removed");
      setModalState({ kind: "closed" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    }
  }, [editingId, remove]);

  return {
    form,
    editingId,
    open: modalState.kind === "form",
    setOpen: (open: boolean) => {
      if (!open) setModalState({ kind: "closed" });
    },
    deleteOpen:
      modalState.kind === "form" && modalState.deleteConfirmOpen === true,
    setDeleteOpen: (open: boolean) => {
      if (!open) {
        setModalState(prev => {
          if (prev.kind !== "form") return prev;
          return { ...prev, deleteConfirmOpen: false };
        });
      }
    },
    openCreate,
    openEdit,
    onSubmit,
    onDeleteClick,
    onDeleteConfirm,
  };
}
