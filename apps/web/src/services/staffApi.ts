import { http } from '../lib/http';
import { Staff } from '../lib/types';

export type StaffPayload = {
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

export async function fetchStaff(q: string) {
  const { data } = await http.get<Staff[]>('/staff', { params: q ? { q } : undefined });
  return data;
}

export async function createStaff(payload: StaffPayload) {
  const { data } = await http.post<Staff>('/staff', payload);
  return data;
}

export async function updateStaff(id: number, payload: StaffPayload) {
  const { data } = await http.put<Staff>(`/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id: number) {
  await http.delete(`/staff/${id}`);
}
