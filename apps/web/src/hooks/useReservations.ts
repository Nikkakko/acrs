import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Reservation } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';
import {
  createReservation,
  deleteReservation,
  fetchReservations,
  type ReservationPayload,
  updateReservation
} from '@/services/reservationApi';

export function useReservationsQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.reservations(date),
    queryFn: () => fetchReservations(date)
  });
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export function useReservationMutations(date: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.reservations(date);
  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: (payload: ReservationPayload) => createReservation(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReservationPayload }) =>
      updateReservation(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Reservation[]>(queryKey);
      if (!previous) return { previous };

      const existing = previous.find((r) => r.id === id);
      if (!existing) return { previous };

      const startTime = payload.startTime;
      const endTime = addMinutes(payload.startTime, payload.durationMin);
      const reservationDate = startTime.slice(0, 10);

      const optimistic: Reservation = {
        ...existing,
        specialist_id: payload.specialistId,
        start_time: startTime,
        end_time: endTime,
        duration_min: payload.durationMin,
        reservation_date: reservationDate
      };

      queryClient.setQueryData<Reservation[]>(queryKey, (old) =>
        old ? old.map((r) => (r.id === id ? optimistic : r)) : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: invalidate
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Reservation[]>(queryKey);
      if (!previous) return { previous };
      queryClient.setQueryData<Reservation[]>(queryKey, (old) =>
        old ? old.filter((r) => r.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
    onSettled: invalidate
  });

  return { create, update, remove };
}
