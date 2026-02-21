import type { Staff } from "./types";

/** Short display name, e.g. "John D." */
export function shortName(staff: Staff): string {
  return `${staff.first_name} ${staff.last_name.charAt(0)}.`;
}
