import apiClient from './client';
import type { Folio } from '../types';

export const approvalApi = {
  getPendingApprovals: () =>
    apiClient.get<Folio[]>('/approval/pending').then((r) => r.data),

  verifyAndRegister: (folioId: number) =>
    apiClient.post<Folio>(`/approval/${folioId}/approve`).then((r) => r.data),

  verifyRejected: (folioId: number) =>
    apiClient.post<Folio>(`/approval/${folioId}/reject`, { reason: 'Rejection verified by registrar' }).then((r) => r.data),

  verifyReported: (folioId: number) =>
    apiClient.post<Folio>(`/approval/${folioId}/verify-reported`).then((r) => r.data),

  sendBack: (folioId: number, data: { reason: string }) =>
    apiClient.post<Folio>(`/approval/${folioId}/send-back`, data).then((r) => r.data),

  flagSuspicious: (folioId: number, data: { reason: string; concerns?: string }) =>
    apiClient.post<Folio>(`/approval/${folioId}/flag-suspicious`, data).then((r) => r.data),
};
