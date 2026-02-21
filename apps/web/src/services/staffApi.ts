import axios from 'axios';
import { http } from '../lib/http';
import { Staff } from '../lib/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function uploadStaffPhoto(file: File): Promise<{ path: string }> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await axios.post<{ path: string }>(`${baseURL}/staff/upload`, formData);
  return data;
}

export function getStaffPhotoUrl(photoUrl: string | null | undefined): string {
  if (!photoUrl) return 'https://via.placeholder.com/48';
  if (photoUrl.startsWith('/')) return `${baseURL}${photoUrl}`;
  return photoUrl;
}

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
