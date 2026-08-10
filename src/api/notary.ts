import apiClient from './client';
import type { NotaryResponse, NotaryStats, CreateNotaryRequest } from '../types';

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const notaryApi = {
  getAll: (params: {
    search?: string;
    district?: string;
    status?: string;
    page?: number;
    size?: number;
  }) =>
    apiClient.get<PaginatedResponse<NotaryResponse>>('/notaries', { params }).then((r) => r.data),

  getStats: () =>
    apiClient.get<NotaryStats>('/notaries/stats').then((r) => r.data),

  search: (q: string) =>
    apiClient.get<NotaryResponse[]>('/notaries/search', { params: { q } }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<NotaryResponse>(`/notaries/${id}`).then((r) => r.data),

  create: (data: CreateNotaryRequest) =>
    apiClient.post<NotaryResponse>('/notaries', data).then((r) => r.data),

  update: (id: number, data: CreateNotaryRequest) =>
    apiClient.put<NotaryResponse>(`/notaries/${id}`, data).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    apiClient.put(`/notaries/${id}/status`, { status }).then((r) => r.data),
};
