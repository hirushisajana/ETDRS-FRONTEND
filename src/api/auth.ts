import apiClient from './client';
import type {
  LoginRequest,
  AuthResponse,
  ActivateRequest,
  InviteDetails,
  PublicRegisterIndividualRequest,
  PublicRegisterCompanyRequest,
  PublicRegisterResponse,
  PublicSetPasswordRequest,
  PublicLoginRequest,
  PublicAuthResponse,
  PublicForgotPasswordRequest,
  PublicResetPasswordRequest,
} from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getInviteDetails: (token: string) =>
    apiClient.get<InviteDetails>(`/auth/activate/${token}`).then((r) => r.data),

  activate: (data: ActivateRequest) =>
    apiClient.post<AuthResponse>('/auth/activate', data).then((r) => r.data),

  resendInvite: (userId: number) =>
    apiClient.post<void>(`/auth/resend-invite/${userId}`).then((r) => r.data),

  logout: () =>
    apiClient.post<void>('/auth/logout').then((r) => r.data),
};

export const publicAuthApi = {
  registerIndividual: (data: PublicRegisterIndividualRequest) =>
    apiClient.post<PublicRegisterResponse>('/public/auth/register/individual', data).then((r) => r.data),

  registerCompany: (data: PublicRegisterCompanyRequest) =>
    apiClient.post<PublicRegisterResponse>('/public/auth/register/company', data).then((r) => r.data),

  setPassword: (data: PublicSetPasswordRequest) =>
    apiClient.post<void>('/public/auth/set-password', data).then((r) => r.data),

  login: (data: PublicLoginRequest) =>
    apiClient.post<PublicAuthResponse>('/public/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post<void>('/public/auth/logout').then((r) => r.data),

  forgotPassword: (data: PublicForgotPasswordRequest) =>
    apiClient.post<void>('/public/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: PublicResetPasswordRequest) =>
    apiClient.post<void>('/public/auth/reset-password', data).then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.get('/public/auth/verify', { params: { token } }).then((r) => r.data),
};
