export const SLOT_MINUTES = 30;

export function startOfDay(iso: string) {
  const date = new Date(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function endOfDay(iso: string) {
  const d = startOfDay(iso);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

export function addMinutes(iso: string, minutes: number) {
  const start = new Date(iso);
  return new Date(start.getTime() + minutes * 60 * 1000);
}
