import type { CertificateStatus } from './enums';

export interface RegistrationCertificate {
  id: number;
  folioId: number;
  daybookNumber: string;
  trustName: string | null;
  registryId: number;
  registryName: string | null;
  issuedBy: string | null;
  issuedDate: string;
  expiryDate: string;
  status: CertificateStatus;
  renewedFromCertificateId: number | null;
  createdAt: string;
  updatedAt: string;
}
