import type { CertificateStatus } from './enums';

export interface RegistrationCertificate {
  id: number;
  folioId: number;
  daybookNumber: string;
  certificateNumber: string | null;
  trustName: string | null;
  registryId: number;
  registryName: string | null;
  issuedBy: string | null;
  issuedDate: string;
  expiryDate: string;
  issuedAt: string | null;
  status: CertificateStatus;
  renewedFromCertificateId: number | null;
  createdAt: string;
  updatedAt: string;
}
