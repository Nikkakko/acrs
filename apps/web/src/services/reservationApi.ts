import { http } from "@/lib/http";
import type { Reservation } from "@/lib/types";

export type ReservationPayload = {
  specialistId: string;
  startTime: string;
  durationMin: number;
  serviceIds: string[];
};

export async function fetchReservations(date: string) {
  const { data } = await http.get<Reservation[]>('/reservations', { params: { date } });
  return data;
}

export async function createReservation(payload: ReservationPayload) {
  const { data } = await http.post<Reservation>('/reservations', payload);
  return data;
}

export async function updateReservation(id: string, payload: ReservationPayload) {
  const { data } = await http.put<Reservation>(`/reservations/${id}`, payload);
  return data;
}

export async function deleteReservation(id: string) {
  await http.delete(`/reservations/${id}`);
}
