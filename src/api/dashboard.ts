import apiClient from './client';
import type {
  RegistryDashboard,
  HeadOfficeDashboard,
  SuperAdminDashboard,
} from '../types';

export const dashboardApi = {
  getSuperAdmin: () =>
    apiClient.get<SuperAdminDashboard>('/dashboard/super-admin').then((r) => r.data),

  getRegistry: () =>
    apiClient.get<RegistryDashboard>('/dashboard/registry').then((r) => r.data),

  getHeadOffice: () =>
    apiClient.get<HeadOfficeDashboard>('/dashboard/head-office').then((r) => r.data),
};
