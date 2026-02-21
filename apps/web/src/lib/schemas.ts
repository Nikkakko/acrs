import { z } from "zod";

const dateTimeString = z.iso.datetime();
const stringMin1 = z.string().min(1, "Name is required");

export const reservationFormSchema = z.object({
  date: dateTimeString,
  specialistId: z.number().refine(v => v > 0, "Select a specialist"),
  startTime: dateTimeString,
  durationMin: z
    .number()
    .refine(v => [30, 60, 90, 120].includes(v), "Invalid duration"),
  serviceIds: z.array(z.number()).min(1, "Select at least one service"),
});

export const staffFormSchema = z.object({
  firstName: stringMin1,
  lastName: stringMin1,
  photoUrl: z.url().optional(),
});

export const serviceFormSchema = z.object({
  name: stringMin1,
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  customFieldValues: z.record(z.string(), z.string()),
});

export const customFieldSchema = z.object({
  name: stringMin1,
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;
export type StaffFormValues = z.infer<typeof staffFormSchema>;
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
