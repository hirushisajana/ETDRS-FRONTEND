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
  issuedByUserId: number | null;
  issuedDate: string;
  expiryDate: string;
  issuedAt: string | null;
  status: CertificateStatus;
  certificateType: 'ORIGINAL' | 'RENEWAL';
  active: boolean | null;
  originalCertificateId: number | null;
  renewedFromCertificateId: number | null;
  renewalAlertSent: boolean | null;
  daysUntilExpiry: number | null;
  createdAt: string;
  updatedAt: string;
}
