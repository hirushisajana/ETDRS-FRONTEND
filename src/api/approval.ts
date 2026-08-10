import apiClient from './client';
import type { Folio } from '../types';

export const approvalApi = {
  getPendingApprovals: () =>
    apiClient.get<Folio[]>('/approval/pending').then((r) => r.data),

  approve: (folioId: number) =>
    apiClient.post<void>(`/approval/${folioId}/approve`).then((r) => r.data),

  reject: (folioId: number, data: { reason: string }) =>
    apiClient.post<void>(`/approval/${folioId}/reject`, data).then((r) => r.data),

  flagSuspicious: (folioId: number, data: { reason: string; concerns?: string }) =>
    apiClient.post<void>(`/approval/${folioId}/flag-suspicious`, data).then((r) => r.data),
};
