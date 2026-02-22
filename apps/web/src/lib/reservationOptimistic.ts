import type { QueryClient } from "@tanstack/react-query";
import type { Reservation } from "@/lib/types";
import type { ReservationPayload } from "@/services/reservationApi";

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

export type OptimisticContext = { previous: Reservation[] | undefined };

export function getOptimisticUpdateHandlers(
  queryClient: QueryClient,
  queryKey: readonly string[],
) {
  return {
    onMutate: async ({
      id,
      payload,
    }: {
      id: number;
      payload: ReservationPayload;
    }): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Reservation[]>(queryKey);
      if (!previous) return { previous };

      const existing = previous.find(r => r.id === id);
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
        reservation_date: reservationDate,
      };

      queryClient.setQueryData<Reservation[]>(queryKey, old =>
        old ? old.map(r => (r.id === id ? optimistic : r)) : old,
      );
      return { previous };
    },
    onError: (_err: Error, _vars: unknown, ctx: OptimisticContext | undefined) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
  };
}

export function getOptimisticRemoveHandlers(
  queryClient: QueryClient,
  queryKey: readonly string[],
) {
  return {
    onMutate: async (id: number): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Reservation[]>(queryKey);
      if (!previous) return { previous };
      queryClient.setQueryData<Reservation[]>(queryKey, old =>
        old ? old.filter(r => r.id !== id) : old,
      );
      return { previous };
    },
    onError: (_err: Error, _vars: unknown, ctx: OptimisticContext | undefined) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },
  };
}
