import type { StaffFormValues } from "@/lib/schemas";
import type { Staff } from "@/lib/types";
import type { StaffPayload } from "@/services/staffApi";

export function formToStaffPayload(values: StaffFormValues): StaffPayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    photoUrl: values.photoUrl || undefined,
  };
}

export function staffToFormValues(staff: Staff): StaffFormValues {
  return {
    firstName: staff.first_name,
    lastName: staff.last_name,
    photoUrl: staff.photo_url || "",
  };
}
