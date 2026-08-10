import apiClient from './client';
import type { ConsentRecord, PrivacyNotice } from '../types';

export const privacyApi = {
  getPrivacyNotice: () =>
    apiClient.get<PrivacyNotice>('/public/privacy').then((r) => r.data),

  giveConsent: (data: { consentType: string }) =>
    apiClient.post<ConsentRecord>('/public/consent', data).then((r) => r.data),

  revokeConsent: (consentType: string) =>
    apiClient.delete<void>(`/public/consent/${consentType}`).then((r) => r.data),
};
