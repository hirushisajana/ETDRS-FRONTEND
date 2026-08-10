import apiClient from './client';
import type { StaffMember } from '../types';

export const staffApi = {
  getAll: () =>
    apiClient.get<StaffMember[]>('/staff').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<StaffMember>(`/staff/${id}`).then((r) => r.data),

  create: (data: { fullName: string; email: string; role: string }) =>
    apiClient.post<StaffMember>('/staff', data).then((r) => r.data),

  update: (id: number, data: { fullName: string; email: string; role: string }) =>
    apiClient.put<StaffMember>(`/staff/${id}`, data).then((r) => r.data),

  getPreview: (id: number) =>
    apiClient.get<string>(`/staff/${id}/preview`).then((r) => r.data),

  sendInvite: (id: number) =>
    apiClient.post<void>(`/staff/${id}/send`).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete<void>(`/staff/${id}`).then((r) => r.data),
};
