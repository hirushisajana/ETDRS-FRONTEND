import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const isPublicPath = typeof config.url === 'string' && config.url.startsWith('/public/');
  const token = isPublicPath
    ? localStorage.getItem('public_auth_token')
    : localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isPublicPath = typeof error.config?.url === 'string' && error.config.url.startsWith('/public/');
      if (isPublicPath) {
        localStorage.removeItem('public_auth_token');
        localStorage.removeItem('public_auth_user');
        window.location.href = '/register';
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
