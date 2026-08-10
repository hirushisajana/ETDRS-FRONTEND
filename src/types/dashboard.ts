import type { UserRole } from './enums';

export interface DashboardStats {
  totalRegistries: number;
  totalUsers: number;
  totalNotaries: number;
  pendingDaybookEntries: number;
  pendingFolios: number;
  pendingApprovals: number;
  activeCertificates: number;
  expiringCertificates: number;
  recentActivities: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  userId: number;
  userEmail: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface RegistryDashboard {
  pendingDaybookEntries: number;
  pendingFolios: number;
  pendingScans: number;
  pendingApprovals: number;
  registeredToday: number;
  rejectedToday: number;
  totalRequests: number;
  activeStaff: number;
  totalStaff: number;
  expiringCertificates: number;
  pendingInvites: number;
  pendingSuspiciousReports: number;
  nextSequenceNumber: number | null;
  nextDaybookFormat: string | null;
}

export interface HeadOfficeDashboard {
  totalRegistries: number;
  totalRegistrations: number;
  pendingApprovals: number;
  suspiciousReports: number;
  registries: RegistryDashboard[];
}

export interface AnnualStats {
  registryId: number;
  registryName: string;
  year: number;
  totalReceived: number;
  totalRegistered: number;
  totalRejected: number;
  totalReported: number;
}

export interface NationalStats {
  year: number;
  totalReceived: number;
  totalRegistered: number;
  totalRejected: number;
  totalReported: number;
}

export interface SuperAdminDashboard {
  totalRegistries: number;
  totalUsers: number;
  totalNotaries: number;
  pendingApprovals: number;
  suspiciousReports: number;
  activeCertificates: number;
  registrationsByRegistry: { registryName: string; count: number }[];
  monthlyRegistrations: { month: string; count: number }[];
}
