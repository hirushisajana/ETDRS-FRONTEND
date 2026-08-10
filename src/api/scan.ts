import apiClient from './client';

export const scanApi = {
  getPendingScans: () =>
    apiClient.get<{ id: number; daybookNumber: string; trustName: string }[]>('/scan/pending').then((r) => r.data),

  uploadDeed: (folioId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<void>(`/scan/${folioId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getDeedFile: (folioId: number) =>
    apiClient.get<Blob>(`/scan/${folioId}/deed`, { responseType: 'blob' }).then((r) => r.data),
};
