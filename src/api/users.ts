import apiClient from './client';
import type { UserResponse, CreateUserRequest, CreateHeadOfficeUserRequest, CreateRegistryAdminRequest } from '../types';

export const userApi = {
  getAll: () =>
    apiClient.get<UserResponse[]>('/users').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<UserResponse>(`/users/${id}`).then((r) => r.data),

  createHeadOffice: (data: CreateHeadOfficeUserRequest) =>
    apiClient.post<UserResponse>('/users/head-office', data).then((r) => r.data),

  createRegistryAdmin: (data: CreateRegistryAdminRequest) =>
    apiClient.post<UserResponse>('/users/registry-admin', data).then((r) => r.data),

  createStaff: (data: CreateUserRequest) =>
    apiClient.post<UserResponse>('/users/staff', data).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    apiClient.put<UserResponse>(`/users/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`).then((r) => r.data),
};
