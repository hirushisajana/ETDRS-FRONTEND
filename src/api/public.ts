import apiClient from './client';
import type { PublicTrustResponse, PublicCertificateInfo, PublicUserResponse } from '../types';

export const publicApi = {
  getMyTrusts: () =>
    apiClient.get<PublicTrustResponse[]>('/public/my-trusts').then((r) => r.data),

  getTrustDetail: (folioId: number) =>
    apiClient.get<PublicTrustResponse>(`/public/trust/${folioId}`).then((r) => r.data),

  getTrustChain: (folioId: number) =>
    apiClient.get<PublicTrustResponse[]>(`/public/trust/${folioId}/chain`).then((r) => r.data),

  getCertificateInfo: (folioId: number) =>
    apiClient.get<PublicCertificateInfo>(`/public/certificate/${folioId}`).then((r) => r.data),

  getMyProfile: () =>
    apiClient.get<PublicUserResponse>('/public/my-data').then((r) => r.data),

  updateMyProfile: (data: Record<string, unknown>) =>
    apiClient.put<PublicUserResponse>('/public/my-data', data).then((r) => r.data),

  deleteMyAccount: () =>
    apiClient.delete<void>('/public/my-data').then((r) => r.data),

  exportMyData: () =>
    apiClient.get<Blob>('/public/my-data/export', { responseType: 'blob' }).then((r) => r.data),
};
