import type { ServiceFormValues } from "@/lib/schemas";
import type { Service } from "@/lib/types";
import type { ServicePayload } from "@/services/serviceApi";

export function formToServicePayload(values: ServiceFormValues): ServicePayload {
  return {
    name: values.name,
    price: Number(values.price),
    color: values.color,
    customFieldValues: values.customFieldValues ?? {},
  };
}

export function serviceToFormValues(service: Service): ServiceFormValues {
  return {
    name: service.name,
    price: Number(service.price) || 0,
    color: service.color,
    customFieldValues: service.customFields ?? {},
  };
}
