import apiClient from './client';
import type {
  Folio,
  CreateFolioRequest,
  FolioDashboardStats,
  Party,
  PartyRequest,
  Property,
  PropertyRequest,
} from '../types';

export const folioApi = {
  getDashboardStats: () =>
    apiClient.get<FolioDashboardStats>('/folio/dashboard').then((r) => r.data),

  getPendingQueue: (registryId?: number) =>
    apiClient.get<Folio[]>('/folio/pending', { params: { registryId } }).then((r) => r.data),

  create: (daybookId: number, data: CreateFolioRequest) =>
    apiClient.post<Folio>(`/folio/${daybookId}`, data).then((r) => r.data),

  update: (id: number, data: Partial<CreateFolioRequest>) =>
    apiClient.put<Folio>(`/folio/${id}`, data).then((r) => r.data),

  submit: (id: number) =>
    apiClient.post<Folio>(`/folio/${id}/submit`).then((r) => r.data),

  report: (id: number, reason: string) =>
    apiClient.post<Folio>(`/folio/${id}/report`, null, { params: { reason } }).then((r) => r.data),

  reject: (id: number, reason: string) =>
    apiClient.post<Folio>(`/folio/${id}/reject`, null, { params: { reason } }).then((r) => r.data),

  flagSuspicious: (id: number, data: { reason: string; concerns?: string }) =>
    apiClient.post<Folio>(`/folio/${id}/flag-suspicious`, data).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Folio>(`/folio/${id}`).then((r) => r.data),

  getByDaybookId: (daybookId: number) =>
    apiClient.get<Folio>(`/folio/by-daybook/${daybookId}`).then((r) => r.data),

  getChain: (id: number) =>
    apiClient.get<Folio[]>(`/folio/${id}/chain`).then((r) => r.data),

  getYears: () =>
    apiClient.get<number[]>('/folio/years').then((r) => r.data),

  getByYear: (year: number, trustType?: string) =>
    apiClient.get<Folio[]>(`/folio/year/${year}`, { params: { trustType } }).then((r) => r.data),

  getCopyPdf: (id: number) =>
    apiClient.get<Blob>(`/folio/${id}/copy`, { responseType: 'blob' }).then((r) => r.data),

  sendUpdate: (id: number) =>
    apiClient.post<void>(`/folio/${id}/send-update`).then((r) => r.data),

  search: (registryId: number, query: string) =>
    apiClient.get<Folio[]>('/folio/search', { params: { registryId, q: query } }).then((r) => r.data),

  getNextFolioNumber: (registryId: number, trustType: string) =>
    apiClient.get<string>('/folio/next-number', { params: { registryId, trustType } }).then((r) => r.data),

  // Parties
  getParties: (folioId: number) =>
    apiClient.get<Party[]>(`/folio/${folioId}/parties`).then((r) => r.data),

  addParty: (folioId: number, data: PartyRequest) =>
    apiClient.post<Party>(`/folio/${folioId}/parties`, data).then((r) => r.data),

  updateParty: (folioId: number, partyId: number, data: Partial<PartyRequest>) =>
    apiClient.put<Party>(`/folio/${folioId}/parties/${partyId}`, data).then((r) => r.data),

  removeParty: (folioId: number, partyId: number) =>
    apiClient.delete<void>(`/folio/${folioId}/parties/${partyId}`).then((r) => r.data),

  // Properties
  getProperties: (folioId: number) =>
    apiClient.get<Property[]>(`/folio/${folioId}/properties`).then((r) => r.data),

  addProperty: (folioId: number, data: PropertyRequest) =>
    apiClient.post<Property>(`/folio/${folioId}/properties`, data).then((r) => r.data),

  updateProperty: (folioId: number, propertyId: number, data: Partial<PropertyRequest>) =>
    apiClient.put<Property>(`/folio/${folioId}/properties/${propertyId}`, data).then((r) => r.data),

  removeProperty: (folioId: number, propertyId: number) =>
    apiClient.delete<void>(`/folio/${folioId}/properties/${propertyId}`).then((r) => r.data),

  // Reported / Email flows
  getReported: () =>
    apiClient.get<Folio[]>('/folio/reported').then((r) => r.data),

  getPendingVerification: () =>
    apiClient.get<Folio[]>('/folio/pending-verification').then((r) => r.data),

  markReadyForHandover: (id: number) =>
    apiClient.post<Folio>(`/folio/${id}/ready-for-handover`).then((r) => r.data),

  getReadyForHandover: () =>
    apiClient.get<Folio[]>('/daybook/handover/ready').then((r) => r.data),

  completeHandover: (id: number, data: {
    handedOverBy?: string;
    collectorIdType?: string;
    collectorIdNumber: string;
    deliveryMethod?: string;
    handoverRemarks?: string;
  }) =>
    apiClient.post<Folio>(`/daybook/handover/${id}`, data).then((r) => r.data),

  getByStatus: (status: string) =>
    apiClient.get<Folio[]>('/folio/by-status', { params: { status } }).then((r) => r.data),

  resendReportEmail: (id: number) =>
    apiClient.post<Folio>(`/folio/${id}/resend-report-email`).then((r) => r.data),

  registerAfterCorrection: (id: number) =>
    apiClient.post<Folio>(`/folio/${id}/register-after-correction`).then((r) => r.data),

  getEmailLogs: (id: number) =>
    apiClient.get<any[]>(`/folio/${id}/email-logs`).then((r) => r.data),

  sendEmail: (id: number, data: { to: string; subject: string; body: string }) =>
    apiClient.post<void>(`/folio/${id}/send-email`, data).then((r) => r.data),
};
