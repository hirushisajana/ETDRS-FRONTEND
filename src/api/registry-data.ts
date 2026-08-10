import apiClient from './client';
import type { Folio, DaybookEntry } from '../types';

export const registryDataApi = {
  search: (params: Record<string, unknown>) =>
    apiClient.get<unknown[]>('/admin/registry-data/search', { params }).then((r) => r.data),

  getFolioDetail: (folioId: number) =>
    apiClient.get<Folio>(`/admin/registry-data/folio/${folioId}`).then((r) => r.data),

  getDaybookDetail: (daybookId: number) =>
    apiClient.get<DaybookEntry>(`/admin/registry-data/daybook/${daybookId}`).then((r) => r.data),

  getFolioChain: (folioId: number) =>
    apiClient.get<Folio[]>(`/admin/registry-data/folio/${folioId}/chain`).then((r) => r.data),
};
