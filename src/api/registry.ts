import apiClient from './client';
import type { LandRegistry, CreateRegistryRequest, UpdateRegistryRequest } from '../types';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface InviteReview {
  registryId: number;
  registryName: string;
  registryCode: string;
  province: string | null;
  district: string | null;
  registryStatus: string;
  adminName: string;
  adminEmail: string;
  invitedByName: string;
}

export interface InvitePreview {
  html: string;
  to: string;
  subject: string;
  adminName: string;
}

export const registryApi = {
  getAll: () =>
    apiClient.get<PageResponse<LandRegistry>>('/registries').then((r) => r.data.content),

  getById: (id: number) =>
    apiClient.get<LandRegistry>(`/registries/${id}`).then((r) => r.data),

  create: (data: CreateRegistryRequest) =>
    apiClient.post<LandRegistry>('/registries', data).then((r) => r.data),

  update: (id: number, data: UpdateRegistryRequest) =>
    apiClient.put<LandRegistry>(`/registries/${id}`, data).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    apiClient.put<LandRegistry>(`/registries/${id}/status`, { status }).then((r) => r.data),

  getInviteReview: (registryId: number) =>
    apiClient.get<InviteReview>(`/registries/${registryId}/invite/review`).then((r) => r.data),

  getInvitePreview: (registryId: number) =>
    apiClient.get<InvitePreview>(`/registries/${registryId}/invite/preview`).then((r) => r.data),

  sendInvite: (registryId: number, body?: { to?: string; subject?: string }) =>
    apiClient.post(`/registries/${registryId}/invite/send`, body || {}).then((r) => r.data),

  discardInvite: (registryId: number) =>
    apiClient.delete(`/registries/${registryId}/invite`).then((r) => r.data),

  resendInvite: (registryId: number) =>
    apiClient.post(`/registries/${registryId}/invite/send`, {}).then((r) => r.data),
};
