import type { RegistryStatus } from './enums';

export interface LandRegistry {
  id: number;
  name: string;
  registryCode: string;
  province: string | null;
  district: string | null;
  address: string | null;
  contactNumber: string | null;
  officialEmail: string | null;
  status: RegistryStatus;
  registryAdminName?: string | null;
  createdAt: string;
  updatedAt: string;
  inviteStatus: string;
}

export interface CreateRegistryRequest {
  name: string;
  registryCode: string;
  province?: string;
  district?: string;
  address?: string;
  contactNumber?: string;
  officialEmail?: string;
  registryAdminFullName?: string;
  registryAdminEmail?: string;
}

export interface UpdateRegistryRequest {
  name?: string;
  province?: string;
  district?: string;
  address?: string;
  contactNumber?: string;
  officialEmail?: string;
  status?: RegistryStatus;
}
