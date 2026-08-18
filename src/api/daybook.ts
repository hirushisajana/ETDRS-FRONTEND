import apiClient from './client';
import type {
  DaybookEntry,
  CreateDaybookRequest,
  DaybookEntryRequest,
  QuarterlyUpdateRequest,
  ResubmissionRequest,
  ReceiptResponse,
  NotaryResponse,
  Folio,
} from '../types';

export const daybookApi = {
  // Counter endpoints
  create: (data: CreateDaybookRequest) =>
    apiClient.post<DaybookEntry>('/daybook', data).then((r) => r.data),

  createUpdate: (data: QuarterlyUpdateRequest) =>
    apiClient.post<DaybookEntry>('/daybook/update', data).then((r) => r.data),

  createResubmission: (data: ResubmissionRequest) =>
    apiClient.post<DaybookEntry>('/daybook/resubmission', data).then((r) => r.data),

  getReceipt: (id: number) =>
    apiClient.get<ReceiptResponse>(`/daybook/${id}/receipt`).then((r) => r.data),

  resendReceipt: (id: number) =>
    apiClient.post(`/daybook/${id}/resend-receipt`).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<DaybookEntry>(`/daybook/${id}`).then((r) => r.data),

  getByDaybookNumber: (daybookNumber: string) =>
    apiClient.get<DaybookEntry>('/daybook/lookup', { params: { daybookNumber } }).then((r) => r.data),

  getRejected: () =>
    apiClient.get<Folio[]>('/daybook/rejected').then((r) => r.data),

  getRecent: (limit = 50) =>
    apiClient.get<DaybookEntry[]>('/daybook/recent', { params: { limit } }).then((r) => r.data),

  getCompletedHandovers: () =>
    apiClient.get<Folio[]>('/daybook/handover/completed').then((r) => r.data),

  checkDeedNumber: (notaryName: string, deedNumber: string) =>
    apiClient.get<boolean>('/daybook/check-deed-number', { params: { notaryName, deedNumber } }).then((r) => r.data),

  getNextNumber: (trustType: string) =>
    apiClient.get<string>('/daybook/next-number', { params: { trustType } }).then((r) => r.data),

  getChain: (id: number) =>
    apiClient.get<DaybookEntry[]>(`/daybook/${id}/chain`).then((r) => r.data),

  // Daybook user endpoints
  getPendingQueue: () =>
    apiClient.get<DaybookEntry[]>('/daybook/pending').then((r) => r.data),

  enterDaybookData: (id: number, data: DaybookEntryRequest) =>
    apiClient.put<DaybookEntry>(`/daybook/${id}/entry`, data).then((r) => r.data),

  verifyNotary: (nic: string) =>
    apiClient.get<NotaryResponse>('/daybook/verify-notary', {
      params: { nic },
    }).then((r) => r.data),

  // Search / list endpoints
  getByYear: (year: number) =>
    apiClient.get<DaybookEntry[]>('/daybook/by-year', { params: { year } }).then((r) => r.data),

  search: (year: number, q: string) =>
    apiClient.get<DaybookEntry[]>('/daybook/search', { params: { year, q } }).then((r) => r.data),
};
