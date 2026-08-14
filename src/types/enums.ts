export type UserRole =
  | 'IT_ADMIN'
  | 'SUPER_ADMIN'
  | 'HEAD_OFFICE'
  | 'REGISTRY_ADMIN'
  | 'COUNTER_USER'
  | 'DAYBOOK_USER'
  | 'FOLIO_USER'
  | 'PUBLIC_USER';

export type HeadOfficeRole = 'AUDITOR' | 'MONITOR' | 'SUPERVISOR';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type RegistryStatus = 'ACTIVE' | 'INACTIVE';

export type TrustType = 'EXPRESS' | 'NORMAL';

export type TrustCategory = 'LOCAL' | 'FOREIGN';

export type FolioType = 'ORIGINAL' | 'QUARTERLY_UPDATE';

export type EntryType = 'ORIGINAL' | 'QUARTERLY_UPDATE';

export type ApprovalStatus = 'PENDING' | 'PENDING_REGISTRAR_VERIFICATION' | 'REPORTED_PENDING_VERIFICATION' | 'REJECTED_PENDING_VERIFICATION' | 'REGISTERED' | 'REJECTED' | 'REPORTED' | 'PENDING_CORRECTION' | 'READY_FOR_HANDOVER' | 'HANDED_OVER' | 'SUSPICIOUS';

export type DaybookEntryStatus =
  | 'PENDING'
  | 'DAYBOOK_ENTERED'
  | 'FOLIO_CREATED'
  | 'FOLIO_SUBMITTED'
  | 'SCAN_UPLOADED'
  | 'PENDING_REGISTRAR_VERIFICATION'
  | 'REPORTED_PENDING_VERIFICATION'
  | 'REJECTED_PENDING_VERIFICATION'
  | 'REGISTERED'
  | 'REJECTED'
  | 'REPORTED'
  | 'PENDING_CORRECTION'
  | 'READY_FOR_HANDOVER'
  | 'HANDED_OVER'
  | 'SUPERSEDED'
  | 'SUSPICIOUS_FLAGGED';

export type CertificateStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWED' | 'REVOKED';

export type SealType = 'GREEN' | 'RED';

export type PartyRole = 'TRUSTOR' | 'TRUSTEE' | 'BENEFICIARY';

export type PartyType = 'INDIVIDUAL' | 'COMPANY';

export type BeneficiaryType = 'NAMED' | 'GROUP' | 'CHARITY';

export type IdType = 'NIC' | 'PASSPORT' | 'DRIVING_LICENSE' | 'COMPANY_REGISTRATION';

export type PropertyType = 'LAND' | 'VEHICLE' | 'CASH' | 'OTHER';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export type NotaryStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type ServiceType = 'ONE_DAY' | 'GENERAL';

export type ReceiptDelivery = 'EMAIL' | 'PRINT' | 'SMS';

export type PurposeFormat = 'SRI_LANKA' | 'FOREIGN';

export type ReportStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'RESOLVED';

export type ConsentType = 'PRIVACY_POLICY' | 'DATA_PROCESSING' | 'MARKETING';
