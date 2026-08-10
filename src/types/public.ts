import type { TrustType, TrustCategory, ApprovalStatus } from './enums';

export interface PublicTrustPartySummary {
  partyRole: string;
  partyType: string;
  beneficiaryType: string | null;
  fullName: string | null;
  groupDescription: string | null;
}

export interface PublicTrustPropertySummary {
  propertyType: string;
  amount: string | null;
  currency: string | null;
  landAmount: string | null;
  vehicleDetails: string | null;
  otherDescription: string | null;
  propertyValue: string | null;
}

export interface PublicTrustResponse {
  folioId: number;
  daybookNumber: string;
  trustName: string;
  trustAddress: string | null;
  trustPurpose: string | null;
  purposeFormat: string | null;
  trustType: TrustType;
  trustCategory: TrustCategory;
  registryName: string;
  approvalStatus: ApprovalStatus;
  certificateStatus: string;
  certificateExpiry: string | null;
  renewalAlert: boolean;
  parties: PublicTrustPartySummary[];
  properties: PublicTrustPropertySummary[];
}

export interface PublicCertificateInfo {
  certificateId: number;
  trustName: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

export interface PublicUserResponse {
  id: number;
  fullName: string;
  email: string;
  nic: string | null;
  companyRegNumber: string | null;
}