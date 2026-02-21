import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function listCustomFields(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.serviceCustomField.findMany({ orderBy: { id: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createCustomField(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const field = await prisma.serviceCustomField.create({ data: { name } });

    const maxPos = await prisma.serviceColumnOrder.aggregate({ _max: { position: true } });
    await prisma.serviceColumnOrder.upsert({
      where: { columnKey: `custom_${field.id}` },
      create: { columnKey: `custom_${field.id}`, position: (maxPos._max.position || 0) + 1 },
      update: {}
    });

    res.status(201).json(field);
  } catch (err) {
    next(err);
  }
}

export async function listServices(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const rows = await prisma.service.findMany({
      include: {
        customFieldValues: {
          include: { field: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    const mapped = rows.map((service) => {
      const customFields: Record<string, string> = {};
      for (const v of service.customFieldValues) {
        customFields[String(v.fieldId)] = v.value;
      }

      return {
        id: service.id,
        name: service.name,
        price: service.price.toString(),
        color: service.color,
        customFields
      };
    });

    const filtered = q
      ? mapped.filter((row) => {
          if (row.name.toLowerCase().includes(q)) return true;
          return Object.values(row.customFields || {}).some((v) => v.toLowerCase().includes(q));
        })
      : mapped;

    res.json(filtered);
  } catch (err) {
    next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, price, color, customFieldValues } = req.body;
    const values = (customFieldValues || {}) as Record<string, unknown>;

    const created = await prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          name,
          price: Number(price),
          color
        }
      });

      for (const [fieldId, value] of Object.entries(values)) {
        await tx.serviceCustomFieldValue.upsert({
          where: {
            serviceId_fieldId: {
              serviceId: service.id,
              fieldId: Number(fieldId)
            }
          },
          create: { serviceId: service.id, fieldId: Number(fieldId), value: String(value || '') },
          update: { value: String(value || '') }
        });
      }

      return service;
    });

    res.status(201).json({ ...created, price: created.price.toString() });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { name, price, color, customFieldValues } = req.body;
    const values = (customFieldValues || {}) as Record<string, unknown>;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const service = await tx.service.update({
        where: { id },
        data: { name, price: Number(price), color }
      });

      await tx.serviceCustomFieldValue.deleteMany({ where: { serviceId: id } });
      for (const [fieldId, value] of Object.entries(values)) {
        await tx.serviceCustomFieldValue.create({
          data: { serviceId: id, fieldId: Number(fieldId), value: String(value || '') }
        });
      }

      return service;
    });

    res.json({ ...updated, price: updated.price.toString() });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.service.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getColumnOrder(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.serviceColumnOrder.findMany({ orderBy: { position: 'asc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateColumnOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const columns: string[] = req.body?.columns || [];
    await prisma.$transaction(
      columns.map((columnKey, i) =>
        prisma.serviceColumnOrder.upsert({
          where: { columnKey },
          create: { columnKey, position: i + 1 },
          update: { position: i + 1 }
        })
      )
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
