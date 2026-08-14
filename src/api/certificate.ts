import apiClient from './client';
import type { RegistrationCertificate } from '../types';

export const certificateApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<RegistrationCertificate[]>('/certificate/all', { params }).then((r) => r.data),

  getByRegistry: () =>
    apiClient.get<RegistrationCertificate[]>('/certificate/registry').then((r) => r.data),

  getExpiring: () =>
    apiClient.get<RegistrationCertificate[]>('/certificate/expiring').then((r) => r.data),

  getByFolioId: (folioId: number) =>
    apiClient.get<RegistrationCertificate>(`/certificate/${folioId}`).then((r) => r.data),

  issue: (folioId: number) =>
    apiClient.post<RegistrationCertificate>(`/certificate/${folioId}/issue`).then((r) => r.data),

  reprint: (id: number) =>
    apiClient.post<RegistrationCertificate>(`/certificate/${id}/reprint`).then((r) => r.data),

  renew: (id: number) =>
    apiClient.post<RegistrationCertificate>(`/certificate/${id}/renew`).then((r) => r.data),

  download: (id: number) =>
    apiClient.get<Blob>(`/certificate/${id}/download`, { responseType: 'blob' }).then((r) => r.data),

  getStatus: (id: number) =>
    apiClient.get<{ status: string }>(`/certificate/${id}/status`).then((r) => r.data),
};
