import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { addMinutes, endOfDay, SLOT_MINUTES, startOfDay } from '../utils/date.js';

async function hasOverlap(params: {
  specialistId: string;
  startTime: Date;
  endTime: Date;
  reservationDate: Date;
  ignoreId?: string;
}) {
  const conflict = await prisma.reservation.findFirst({
    where: {
      specialistId: params.specialistId,
      reservationDate: params.reservationDate,
      id: params.ignoreId ? { not: params.ignoreId } : undefined,
      startTime: { lt: params.endTime },
      endTime: { gt: params.startTime }
    },
    select: { id: true }
  });

  return Boolean(conflict);
}

export async function listReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const date = String(req.query.date || '').slice(0, 10);
    if (!date) {
      res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });
      return;
    }

    const gte = startOfDay(`${date}T00:00:00.000Z`);
    const lt = endOfDay(`${date}T00:00:00.000Z`);

    const rows = await prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte,
          lt
        }
      },
      include: {
        serviceLinks: {
          include: { service: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(
      rows.map((r) => ({
        id: r.id,
        specialist_id: r.specialistId,
        reservation_date: r.reservationDate,
        start_time: r.startTime,
        end_time: r.endTime,
        duration_min: r.durationMin,
        services: r.serviceLinks.map((l) => ({ id: l.service.id, name: l.service.name, color: l.service.color }))
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function createReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const { specialistId, startTime, durationMin, serviceIds } = req.body;
    const duration = Number(durationMin);
    if (!specialistId || !startTime || !duration || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      res.status(400).json({ message: 'Missing required reservation fields' });
      return;
    }

    if (duration % SLOT_MINUTES !== 0) {
      res.status(400).json({ message: `Duration must be multiple of ${SLOT_MINUTES}` });
      return;
    }

    const start = new Date(startTime);
    const end = addMinutes(startTime, duration);
    const reservationDate = startOfDay(startTime);

    if (await hasOverlap({ specialistId: specialistId, startTime: start, endTime: end, reservationDate })) {
      res.status(409).json({ message: 'Reservation overlap for selected specialist' });
      return;
    }

    const created = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          specialistId: specialistId,
          reservationDate,
          startTime: start,
          endTime: end,
          durationMin: duration
        }
      });

      for (let i = 0; i < serviceIds.length; i += 1) {
        await tx.reservationService.create({
          data: {
            reservationId: reservation.id,
            serviceId: serviceIds[i],
            sortOrder: i
          }
        });
      }

      return reservation;
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateReservation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { specialistId, startTime, durationMin, serviceIds } = req.body;
    const duration = Number(durationMin);

    if (duration % SLOT_MINUTES !== 0) {
      res.status(400).json({ message: `Duration must be multiple of ${SLOT_MINUTES}` });
      return;
    }

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const start = new Date(startTime);
    const end = addMinutes(startTime, duration);
    const reservationDate = startOfDay(startTime);

    if (
      await hasOverlap({
        specialistId: specialistId,
        startTime: start,
        endTime: end,
        reservationDate,
        ignoreId: id 
      })
    ) {
      res.status(409).json({ message: 'Reservation overlap for selected specialist' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.update({
        where: { id },
        data: {
          specialistId: specialistId,
          reservationDate,
          startTime: start,
          endTime: end,
          durationMin: duration
        }
      });

      await tx.reservationService.deleteMany({ where: { reservationId: id } });
      for (let i = 0; i < serviceIds.length; i += 1) {
        await tx.reservationService.create({
          data: {
            reservationId: id,
            serviceId: serviceIds[i],
            sortOrder: i
          }
        });
      }

      return reservation;
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteReservation(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id as string;
  try {
    await prisma.reservation.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
