import type { ReservationFormValues } from '@/lib/schemas';
import type { Reservation } from '@/lib/types';
import { snapTimeToSlot, toDateOnly, toISOFromLocalDateTime, toTime } from '@/lib/timeUtils';
import type { ReservationPayload } from '@/services/reservationApi';

export function formToReservationPayload(values: ReservationFormValues): ReservationPayload {
  return {
    specialistId: values.specialistId,
    startTime: toISOFromLocalDateTime(values.date, values.startTime),
    durationMin: values.durationMin,
    serviceIds: values.serviceIds
  };
}

export function reservationToFormValues(reservation: Reservation): ReservationFormValues {
  return {
    date: toDateOnly(new Date(reservation.reservation_date)),
    specialistId: reservation.specialist_id,
    startTime: snapTimeToSlot(toTime(reservation.start_time)),
    durationMin: reservation.duration_min,
    serviceIds: reservation.services.map((s) => s.id)
  };
}
