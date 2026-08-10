import apiClient from './client';
import type { SuspiciousReport } from '../types';

export const suspiciousApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<SuspiciousReport[]>('/suspicious', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<SuspiciousReport>(`/suspicious/${id}`).then((r) => r.data),

  acknowledge: (id: number) =>
    apiClient.put<void>(`/suspicious/${id}/acknowledge`).then((r) => r.data),

  sendToDefence: (id: number) =>
    apiClient.post<void>(`/suspicious/${id}/send-defence`).then((r) => r.data),

  sendToFiu: (id: number) =>
    apiClient.post<void>(`/suspicious/${id}/send-fiu`).then((r) => r.data),

  downloadPdf: (id: number) =>
    apiClient.get<Blob>(`/suspicious/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
};
