import { FormEvent, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useReservationMutations, useReservationsQuery } from '../hooks/useReservations';
import { useServicesQuery } from '../hooks/useServices';
import { useStaffQuery } from '../hooks/useStaff';
import { Reservation, Staff } from '../lib/types';

type ReservationForm = {
  specialistId: number;
  startTime: string;
  durationMin: number;
  serviceIds: number[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timeSlots() {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h += 1) {
    for (const m of [0, 30]) {
      if (h === 20 && m > 0) continue;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

function toTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 16);
}

function minutesFromTime(v: string) {
  const [h, m] = v.split(':').map(Number);
  return h * 60 + m;
}

function shortName(staff: Staff) {
  return `${staff.first_name} ${staff.last_name.charAt(0)}.`;
}

function findReservationAt(reservations: Reservation[], specialistId: number, time: string) {
  return reservations.find((r) => {
    if (r.specialist_id !== specialistId) return false;
    const start = minutesFromTime(toTime(r.start_time));
    const end = minutesFromTime(toTime(r.end_time));
    const point = minutesFromTime(time);
    return start <= point && point < end;
  });
}

export function SchedulePage() {
  const [date, setDate] = useState(today());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ReservationForm>({
    specialistId: 0,
    startTime: '09:00',
    durationMin: 30,
    serviceIds: []
  });

  const slots = useMemo(() => timeSlots(), []);

  const { data: staff = [] } = useStaffQuery('');
  const { data: services = [] } = useServicesQuery('');
  const { data: rows = [] } = useReservationsQuery(date);
  const { create, update, remove } = useReservationMutations(date);

  const openCreate = (specialistId: number, startTime: string) => {
    setEditingId(null);
    setError('');
    setForm({ specialistId, startTime, durationMin: 30, serviceIds: [] });
    setOpen(true);
  };

  const openEdit = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setError('');
    setForm({
      specialistId: reservation.specialist_id,
      startTime: toTime(reservation.start_time),
      durationMin: reservation.duration_min,
      serviceIds: reservation.services.map((s) => s.id)
    });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      specialistId: Number(form.specialistId),
      startTime: `${date}T${form.startTime}:00.000Z`,
      durationMin: Number(form.durationMin),
      serviceIds: form.serviceIds
    };

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, payload });
      } else {
        await create.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reservation');
    }
  };

  const onDelete = async () => {
    if (!editingId) return;
    if (!confirm('Delete this reservation?')) return;
    await remove.mutateAsync(editingId);
    setOpen(false);
  };

  return (
    <section>
      <div className="section-head">
        <h2>Schedule</h2>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="schedule-wrap">
        <table className="schedule-grid">
          <thead>
            <tr>
              <th>Time</th>
              {staff.map((s) => (
                <th key={s.id}>
                  {s.first_name} {s.last_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot}>
                <td className="time-col">{slot}</td>
                {staff.map((s) => {
                  const reservation = findReservationAt(rows, s.id, slot);
                  const isStart = reservation && toTime(reservation.start_time) === slot;

                  return (
                    <td key={`${s.id}-${slot}`} className="slot-cell" onClick={() => !reservation && openCreate(s.id, slot)}>
                      {reservation && isStart ? (
                        <button
                          className="reservation-card"
                          style={{ background: reservation.services[0]?.color || '#53B3CB' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(reservation);
                          }}
                        >
                          <strong>{reservation.services[0]?.name || 'Service'}</strong>
                          {reservation.services.length > 1 ? (
                            <ul>
                              {reservation.services.slice(1).map((srv) => (
                                <li key={srv.id}>{srv.name}</li>
                              ))}
                            </ul>
                          ) : null}
                          <small>
                            {toTime(reservation.start_time)} - {toTime(reservation.end_time)} | {shortName(s)}
                          </small>
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
            <DialogDescription>Choose specialist, duration, and multiple services.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="stack-form">
            <label className="field-label">
              Date
              <Input value={date} readOnly />
            </label>

            <label className="field-label">
              Start Time
              <Input
                type="time"
                step={1800}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </label>

            <label className="field-label">
              Specialist
              <select
                value={String(form.specialistId)}
                onChange={(e) => setForm({ ...form, specialistId: Number(e.target.value) })}
                required
              >
                <option value="">Select specialist</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Duration
              <select value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </label>

            <label className="field-label">
              Services (multi-select)
              <select
                multiple
                value={form.serviceIds.map(String)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serviceIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value))
                  })
                }
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="error-text">{error}</p> : null}

            <div className="row">
              <Button type="submit" disabled={create.isPending || update.isPending}>
                Save
              </Button>
              {editingId ? (
                <Button type="button" variant="destructive" onClick={onDelete} disabled={remove.isPending}>
                  Delete
                </Button>
              ) : null}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
