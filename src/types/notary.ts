export interface NotaryResponse {
  id: number;
  fullName: string;
  nic: string;
  notaryRegistrationNumber: string;
  district: string;
  status: string;
  registeredDate: string | null;
  createdAt: string | null;
}

export interface NotaryStats {
  total: number;
  active: number;
  suspended: number;
  deregistered: number;
}

export interface CreateNotaryRequest {
  fullName: string;
  nic: string;
  notaryRegistrationNumber: string;
  district?: string;
  registeredDate?: string | null;
  status?: string;
}
