import { http } from "@/lib/http";
import type { CustomField, Service } from "@/lib/types";

export type ServicePayload = {
  name: string;
  price: number;
  color: string;
  customFieldValues: Record<string, string>;
};

export type ColumnOrderRow = {
  columnKey: string;
  position: number;
};

export async function fetchServices(q: string) {
  const { data } = await http.get<Service[]>('/services', { params: q ? { q } : undefined });
  return data;
}

export async function createService(payload: ServicePayload) {
  const { data } = await http.post<Service>('/services', payload);
  return data;
}

export async function updateService(id: string, payload: ServicePayload) {
  const { data } = await http.put<Service>(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id: string) {
  await http.delete(`/services/${id}`);
}

export async function fetchServiceCustomFields() {
  const { data } = await http.get<CustomField[]>('/service-custom-fields');
  return data;
}

export async function createServiceCustomField(name: string) {
  const { data } = await http.post<CustomField>('/service-custom-fields', { name });
  return data;
}

export async function deleteServiceCustomField(id: string) {
  await http.delete(`/service-custom-fields/${id}`);
}

export async function fetchServiceColumnOrder() {
  const { data } = await http.get<ColumnOrderRow[]>('/service-column-order');
  return data;
}

export async function updateServiceColumnOrder(columns: string[]) {
  await http.put('/service-column-order', { columns });
}
