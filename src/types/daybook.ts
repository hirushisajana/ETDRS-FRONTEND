import type {
  TrustType,
  TrustCategory,
  EntryType,
  DaybookEntryStatus,
  ServiceType,
  ReceiptDelivery,
} from './enums';

export interface DaybookEntry {
  id: number;
  daybookNumber: string;
  registryId: number;
  trustType: TrustType;
  sequenceNumber: number;
  year: number;
  trustCategory: TrustCategory;
  entryType: EntryType;
  originalDaybookNumber: string | null;
  quarterlyUpdateNumber: number | null;
  clientName: string | null;
  clientEmail: string | null;
  clientTelephone: string | null;
  deedNumber: string | null;
  serviceType: ServiceType | null;
  registrationFee: number | null;
  receiptDelivery: ReceiptDelivery | null;
  deedType: string | null;
  submitterName: string | null;
  submitterAddress: string | null;
  attestedDate: string | null;
  language: string | null;
  notaryId: number | null;
  notaryName: string | null;
  valueOfAmount: number | null;
  numberOfLots: number | null;
  division: string | null;
  volume: string | null;
  folioRef: string | null;
  returnDate: string | null;
  acceptorSignature: string | null;
  acceptorDate: string | null;
  registrarInitials: string | null;
  remarks: string | null;
  status: DaybookEntryStatus;
  emailSent: boolean | null;
  suspiciousFlag: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDaybookRequest {
  trustType: TrustType;
  trustCategory: TrustCategory;
  clientName: string;
  notaryName: string;
  clientEmail?: string;
  clientTelephone?: string;
  deedNumber?: string;
  serviceType: ServiceType;
  registrationFee: number;
  receiptDelivery: ReceiptDelivery;
  deedType?: string;
  submitterName?: string;
  submitterAddress?: string;
}

export interface DaybookEntryRequest {
  clientName?: string;
  clientEmail?: string;
  clientTelephone?: string;
  deedNumber?: string;
  serviceType?: ServiceType;
  registrationFee?: number;
  receiptDelivery?: ReceiptDelivery;
  deedType?: string;
  submitterName?: string;
  submitterAddress?: string;
  attestedDate?: string;
  language?: string;
  notaryId?: number;
  valueOfAmount?: number;
  numberOfLots?: number;
  division?: string;
  volume?: string;
  folioRef?: string;
  returnDate?: string;
  acceptorSignature?: string;
  acceptorDate?: string;
  registrarInitials?: string;
  remarks?: string;
}

export interface QuarterlyUpdateRequest {
  originalDaybookNumber: string;
  clientName?: string;
  clientEmail?: string;
  clientTelephone?: string;
}

export interface ResubmissionRequest {
  originalDaybookNumber: string;
  trustType: TrustType;
  trustCategory: TrustCategory;
  clientName: string;
  clientEmail?: string;
  clientTelephone?: string;
  deedNumber?: string;
  serviceType: ServiceType;
  registrationFee: number;
  receiptDelivery: ReceiptDelivery;
}

export interface ReceiptResponse {
  registryName: string;
  clientName: string;
  daybookNumber: string;
  deedNumber: string | null;
  registrationFee: number;
  serviceType: string;
  receiptDelivery: string;
  generatedAt: string;
}
