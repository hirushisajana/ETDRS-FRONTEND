import apiClient from './client';
import type { AnnualStats, NationalStats } from '../types';

export const statsApi = {
  getByRegistry: (registryId: number) =>
    apiClient.get<AnnualStats[]>(`/stats/registry/${registryId}/annual`).then((r) => r.data),

  getByRegistryAndYear: (registryId: number, year: number) =>
    apiClient.get<AnnualStats>(`/stats/registry/${registryId}/year/${year}`).then((r) => r.data),

  getNationalAll: () =>
    apiClient.get<NationalStats[]>('/stats/national/annual').then((r) => r.data),

  getNationalByYear: (year: number) =>
    apiClient.get<NationalStats>(`/stats/national/year/${year}`).then((r) => r.data),
};
