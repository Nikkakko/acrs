import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import {
  createReservation,
  deleteReservation,
  fetchReservations,
  ReservationPayload,
  updateReservation
} from '../services/reservationApi';

export function useReservationsQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.reservations(date),
    queryFn: () => fetchReservations(date)
  });
}

export function useReservationMutations(date: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reservations', date] });

  const create = useMutation({
    mutationFn: (payload: ReservationPayload) => createReservation(payload),
    onSuccess: invalidate
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReservationPayload }) => updateReservation(id, payload),
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onSuccess: invalidate
  });

  return { create, update, remove };
}
