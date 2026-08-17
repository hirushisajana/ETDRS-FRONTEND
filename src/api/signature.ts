import apiClient from './client';
import type { RegistrarSignature } from '../types';

export const signatureApi = {
  getMySignature: () =>
    apiClient.get<RegistrarSignature | null>('/signature/my').then((r) => r.data),

  uploadSignature: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<RegistrarSignature>('/signature/my', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  getSignatureFileUrl: (id: number) => `/signature/${id}/file`,
};
