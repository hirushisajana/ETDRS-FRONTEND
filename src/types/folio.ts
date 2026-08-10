import type {
  TrustType,
  TrustCategory,
  FolioType,
  ApprovalStatus,
  SealType,
} from './enums';

export interface Folio {
  id: number;
  daybookEntryId: number;
  daybookNumber: string;
  registryId: number;
  registryName: string | null;
  registryCode: string | null;
  trustType: TrustType;
  trustCategory: TrustCategory;
  folioType: FolioType;
  year: number;
  volumeNumber: string | null;
  folioNumber: string | null;
  broughtForwardVolume: string | null;
  broughtForwardFolio: string | null;
  trustName: string | null;
  trustAddress: string | null;
  trustPurpose: string | null;
  purposeFormat: string | null;
  updateDetails: string | null;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  reportReason: string | null;
  sealType: SealType | null;
  sealAppliedAt: string | null;
  scanFilePath: string | null;
  hasScan: boolean | null;
  sentToRegistrarGeneral: boolean | null;
  sentToLandRegistrar: boolean | null;
  sentAt: string | null;
  remarks: string | null;
  notaryName: string | null;
  notaryId: number | null;
  instrumentNumber: string | null;
  instrumentDate: string | null;
  deedNumber: string | null;
  attestedDate: string | null;
  registrarGeneralSignatureDate: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  parties: Party[] | null;
  properties: Property[] | null;
}

export interface CreateFolioRequest {
  trustCategory?: string;
  trustName?: string;
  trustAddress?: string;
  trustPurpose?: string;
  purposeFormat?: string;
  volumeNumber?: string;
  folioNumber?: string;
  broughtForwardVolume?: string;
  broughtForwardFolio?: string;
  instrumentNumber?: string;
  instrumentDate?: string;
  notaryName?: string;
  notaryId?: number;
  registrarGeneralSignatureDate?: string;
  remarks?: string;
}

export interface FolioDashboardStats {
  pendingFolios: number;
  registeredToday: number;
  rejectedToday: number;
  reportedCount: number;
  pendingCorrectionCount: number;
  totalThisYear: number;
}

export interface Party {
  id: number;
  folioId: number;
  partyRole: string;
  partyType: string;
  beneficiaryType: string | null;
  fullName: string | null;
  idType: string | null;
  idNumber: string | null;
  companyRegNumber: string | null;
  address: string | null;
  foreignAddress: string | null;
  isForeign: boolean;
  groupDescription: string | null;
  verificationStatus: string;
  verifiedAt: string | null;
  verifiedBySource: string | null;
}

export interface PartyRequest {
  partyRole: string;
  partyType: string;
  beneficiaryType?: string;
  fullName?: string;
  idType?: string;
  idNumber?: string;
  companyRegNumber?: string;
  address?: string;
  foreignAddress?: string;
  isForeign?: boolean;
  groupDescription?: string;
}

export interface Property {
  id: number;
  folioId: number;
  propertyType: string;
  amount: number | null;
  currency: string | null;
  landAmount: number | null;
  landRegistrationNumber: string | null;
  landRegistrationDepartment: string | null;
  vehicleDetails: string | null;
  otherDescription: string | null;
  propertyValue: number | null;
}

export interface PropertyRequest {
  propertyType: string;
  amount?: number;
  currency?: string;
  landAmount?: number;
  landRegistrationNumber?: string;
  landRegistrationDepartment?: string;
  vehicleDetails?: string;
  otherDescription?: string;
  propertyValue?: number;
}
