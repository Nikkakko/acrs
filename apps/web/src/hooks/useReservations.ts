import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getOptimisticRemoveHandlers,
  getOptimisticUpdateHandlers,
} from "@/lib/reservationOptimistic";
import {
  createReservation,
  deleteReservation,
  fetchReservations,
  type ReservationPayload,
  updateReservation,
} from "@/services/reservationApi";

export function useReservationsQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.reservations(date),
    queryFn: () => fetchReservations(date),
  });
}

export function useReservationMutations(date: string) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.reservations(date);
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const updateHandlers = getOptimisticUpdateHandlers(queryClient, queryKey);
  const removeHandlers = getOptimisticRemoveHandlers(queryClient, queryKey);

  const create = useMutation({
    mutationFn: (payload: ReservationPayload) => createReservation(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReservationPayload }) =>
      updateReservation(id, payload),
    onMutate: updateHandlers.onMutate,
    onError: updateHandlers.onError,
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReservation(id),
    onMutate: removeHandlers.onMutate,
    onError: removeHandlers.onError,
    onSettled: invalidate,
  });

  return { create, update, remove };
}
