import apiClient from './client';
import type { SuspiciousReport } from '../types';

export const suspiciousApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient
      .get<{ content: SuspiciousReport[] }>('/suspicious', { params })
      .then((r) => r.data.content),

  getById: (id: number) =>
    apiClient.get<SuspiciousReport>(`/suspicious/${id}`).then((r) => r.data),

  getDeedFile: (id: number) =>
    apiClient.get<Blob>(`/suspicious/${id}/deed`, { responseType: 'blob' }).then((r) => r.data),

  verifyReport: (id: number) =>
    apiClient.post<SuspiciousReport>(`/suspicious/${id}/verify`).then((r) => r.data),

  acknowledge: (id: number) =>
    apiClient.put<void>(`/suspicious/${id}/acknowledge`).then((r) => r.data),

  sendToDefence: (id: number) =>
    apiClient.post<void>(`/suspicious/${id}/send-defence`).then((r) => r.data),

  sendToFiu: (id: number) =>
    apiClient.post<void>(`/suspicious/${id}/send-fiu`).then((r) => r.data),

  downloadPdf: (id: number) =>
    apiClient.get<Blob>(`/suspicious/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
};
