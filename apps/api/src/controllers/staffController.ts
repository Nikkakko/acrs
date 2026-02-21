import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

function mapStaff(row: { id: number; firstName: string; lastName: string; photoUrl: string | null }) {
  return {
    id: row.id,
    first_name: row.firstName,
    last_name: row.lastName,
    photo_url: row.photoUrl
  };
}

export async function listStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '').trim();
    const rows = await prisma.staff.findMany({
      where: q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          }
        : undefined,
      orderBy: { id: 'asc' }
    });
    res.json(rows.map(mapStaff));
  } catch (err) {
    next(err);
  }
}

export async function createStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, photoUrl } = req.body;
    const row = await prisma.staff.create({
      data: { firstName, lastName, photoUrl: photoUrl || null }
    });
    res.status(201).json(mapStaff(row));
  } catch (err) {
    next(err);
  }
}

export async function updateStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, photoUrl } = req.body;

    const exists = await prisma.staff.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ message: 'Staff not found' });
      return;
    }

    const row = await prisma.staff.update({
      where: { id },
      data: { firstName, lastName, photoUrl: photoUrl || null }
    });

    res.json(mapStaff(row));
  } catch (err) {
    next(err);
  }
}

export async function deleteStaff(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.staff.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
