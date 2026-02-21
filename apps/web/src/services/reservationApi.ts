import { http } from '../lib/http';
import { Reservation } from '../lib/types';

export type ReservationPayload = {
  specialistId: number;
  startTime: string;
  durationMin: number;
  serviceIds: number[];
};

export async function fetchReservations(date: string) {
  const { data } = await http.get<Reservation[]>('/reservations', { params: { date } });
  return data;
}

export async function createReservation(payload: ReservationPayload) {
  const { data } = await http.post<Reservation>('/reservations', payload);
  return data;
}

export async function updateReservation(id: number, payload: ReservationPayload) {
  const { data } = await http.put<Reservation>(`/reservations/${id}`, payload);
  return data;
}

export async function deleteReservation(id: number) {
  await http.delete(`/reservations/${id}`);
}
