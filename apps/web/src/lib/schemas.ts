import { z } from "zod";
import { RESERVATION_DURATIONS } from "./constants";

const stringMin1 = z.string().min(1, "Name is required");
const isUrl = z.url();
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const timeOnly = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
    "Time must be in HH:mm format",
  );

const colorRegex = /^#[0-9A-Fa-f]{6}$/;
const colorRefine = z.string().regex(colorRegex, "Invalid color format");
export const reservationFormSchema = z.object({
  date: dateOnly,
  specialistId: z.number().refine(v => v > 0, "Select a specialist"),
  startTime: timeOnly,
  durationMin: z
    .number()
    .refine(
      v => RESERVATION_DURATIONS.some(d => d.value === v),
      "Invalid duration",
    ),
  serviceIds: z.array(z.number()).min(1, "Select at least one service"),
});

export const staffFormSchema = z.object({
  firstName: stringMin1,
  lastName: stringMin1,
  photoUrl: z
    .union([isUrl, z.string().startsWith("/")])
    .optional()
    .or(z.literal("")),
});

export const serviceFormSchema = z.object({
  name: stringMin1,
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  color: colorRefine,
  customFieldValues: z.record(z.string(), z.string()),
});

export const customFieldSchema = z.object({
  name: stringMin1,
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;
export type StaffFormValues = z.infer<typeof staffFormSchema>;
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
