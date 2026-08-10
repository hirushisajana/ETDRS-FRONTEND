import type { UserRole, HeadOfficeRole, UserStatus } from './enums';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  registryId: number | null;
  registryName: string | null;
  headOfficeRole: HeadOfficeRole | null;
}

export interface ActivateRequest {
  token: string;
  password: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  headOfficeRole: HeadOfficeRole | null;
  status: UserStatus;
  registryId: number | null;
  registryName: string | null;
  nic: string | null;
  companyRegNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
  registryId?: number;
  headOfficeRole?: HeadOfficeRole;
  nic?: string;
  companyRegNumber?: string;
}

export interface CreateHeadOfficeUserRequest {
  fullName: string;
  email: string;
  headOfficeRole: HeadOfficeRole;
}

export interface CreateRegistryAdminRequest {
  fullName: string;
  email: string;
  registryId: number;
}

export interface PublicRegisterIndividualRequest {
  idType: 'NIC' | 'PASSPORT';
  idNumber: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface PublicRegisterCompanyRequest {
  companyRegNumber: string;
  companyName: string;
  email: string;
}

export interface PublicRegisterResponse {
  message: string;
  setupToken: string;
  maskedContact: string;
}

export interface PublicLoginRequest {
  identityType: 'NIC' | 'PASSPORT' | 'COMPANY';
  identityValue: string;
  password: string;
}

export interface PublicAuthResponse {
  token: string;
  displayName: string;
  identityType: string;
  identityValue: string;
}

export interface PublicSetPasswordRequest {
  setupToken: string;
  password: string;
  confirmPassword: string;
}

export interface InviteDetails {
  fullName: string;
  email: string;
  role: string;
  registryName: string | null;
  registryCode: string | null;
  expired: boolean;
}

export interface PublicForgotPasswordRequest {
  identityType: 'NIC' | 'PASSPORT' | 'COMPANY';
  identityValue: string;
}

export interface PublicResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
