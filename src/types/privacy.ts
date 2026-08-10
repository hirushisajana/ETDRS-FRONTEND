import type { ConsentType } from './enums';

export interface ConsentRecord {
  id: number;
  userId: number;
  consentType: ConsentType;
  givenAt: string;
  ipAddress: string;
  documentVersion: string;
  revokedAt: string | null;
}

export interface PrivacyNotice {
  title: string;
  version: string;
  lastUpdated: string;
  sections: PrivacySection[];
}

export interface PrivacySection {
  heading: string;
  content: string;
}
