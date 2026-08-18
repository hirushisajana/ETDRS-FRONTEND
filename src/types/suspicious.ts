import type { ReportStatus } from './enums';

export interface SuspiciousReport {
  id: number;
  daybookEntryId: number;
  folioId: number | null;
  registryId: number;
  reportedBy: number;
  reportedByName: string;
  verifiedByName: string | null;
  verifiedAt: string | null;
  reason: string;
  concerns: string | null;
  trustName: string | null;
  partiesSummary: string | null;
  deedScanPath: string | null;
  reportStatus: ReportStatus;
  sentToDefence: boolean;
  sentToDefenceAt: string | null;
  sentToFiu: boolean;
  sentToFiuAt: string | null;
  createdAt: string;
  updatedAt: string;
}
