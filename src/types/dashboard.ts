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

export interface PendingInviteItem {
  id: number;
  fullName: string;
  role: string;
  headOfficeRole: string | null;
  registryId: number | null;
  status: string;
  inviteExpiresAt: string | null;
}

export interface RegistryActivityItem {
  registryCode: string;
  received: number;
  registered: number;
  rejected: number;
}

export interface NationalStatItem {
  registryId: number;
  totalReceived: number;
  totalRegistered: number;
  totalRejected: number;
  totalReported: number;
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
  requestsThisMonth: number;
  pendingInvites: number;
  expiredInvites: number;
  pendingSuspiciousReports: number;
  certificatesExpiringSoon: number;
  recentPendingInvitesList: PendingInviteItem[];
  registryActivityCurrentMonth: RegistryActivityItem[];
  nationalStatsCurrentYear: NationalStatItem[];
}
