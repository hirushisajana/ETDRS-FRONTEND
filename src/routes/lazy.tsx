import { lazy } from 'react';

export const LandingPage = lazy(() => import('../pages/landing/LandingPage'));

export const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const ActivatePage = lazy(() => import('../pages/auth/ActivatePage'));
export const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));

export const RegisterOrSignInPage = lazy(() => import('../pages/portal/RegisterOrSignInPage'));
export const PublicForgotPasswordPage = lazy(() => import('../pages/portal/PublicForgotPasswordPage'));
export const PublicResetPasswordPage = lazy(() => import('../pages/portal/PublicResetPasswordPage'));
export const PublicPortalHome = lazy(() => import('../pages/portal/PublicPortalHome'));
export const PublicTrustDetailPage = lazy(() => import('../pages/portal/PublicTrustDetailPage'));

export const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
export const RegistryDashboardPage = lazy(() => import('../pages/dashboard/RegistryDashboardPage'));
export const DashboardRedirect = lazy(() => import('../pages/dashboard/DashboardRedirect'));

export const RegistryListPage = lazy(() => import('../pages/registry/RegistryListPage'));
export const RegistryFormPage = lazy(() => import('../pages/registry/RegistryFormPage'));
export const InviteReviewPage = lazy(() => import('../pages/registry/InviteReviewPage'));

export const UserListPage = lazy(() => import('../pages/users/UserListPage'));
export const UserFormPage = lazy(() => import('../pages/users/UserFormPage'));

export const CounterPage = lazy(() => import('../pages/counter/CounterPage'));
export const CounterHandoverPage = lazy(() => import('../pages/counter/CounterHandoverPage'));
export const RecentEntriesPage = lazy(() => import('../pages/counter/RecentEntriesPage'));
export const RejectedDeedsPage = lazy(() => import('../pages/counter/RejectedDeedsPage'));
export const CompletedHandoversPage = lazy(() => import('../pages/counter/CompletedHandoversPage'));

export const DaybookPendingPage = lazy(() => import('../pages/daybook/DaybookPendingPage'));

export const DaybookListPage = lazy(() => import('../pages/daybook/DaybookListPage'));
export const DaybookDetailPage = lazy(() => import('../pages/daybook/DaybookDetailPage'));

export const FolioListPage = lazy(() => import('../pages/folio/FolioListPage'));
export const FolioFormPage = lazy(() => import('../pages/folio/FolioFormPage'));
export const FolioDetailPage = lazy(() => import('../pages/folio/FolioDetailPage'));
export const FolioAdminListPage = lazy(() => import('../pages/folio/FolioAdminListPage'));
export const FolioAdminDetailPage = lazy(() => import('../pages/folio/FolioAdminDetailPage'));
export const FolioChainViewPage = lazy(() => import('../pages/folio/FolioChainViewPage'));
export const MyFoliosPage = lazy(() => import('../pages/folio/MyFoliosPage'));
export const ReportedDeedsPage = lazy(() => import('../pages/folio/ReportedDeedsPage'));

export const ApprovalPage = lazy(() => import('../pages/approval/ApprovalPage'));

export const SignatureSetupPage = lazy(() => import('../pages/signature/SignatureSetupPage'));

export const ScanPage = lazy(() => import('../pages/scan/ScanPage'));

export const CertificateListPage = lazy(() => import('../pages/certificates/CertificateListPage'));

export const SuspiciousListPage = lazy(() => import('../pages/suspicious/SuspiciousListPage'));

export const StaffListPage = lazy(() => import('../pages/staff/StaffListPage'));
export const StaffFormPage = lazy(() => import('../pages/staff/StaffFormPage'));
export const StaffInviteReviewPage = lazy(() => import('../pages/staff/StaffInviteReviewPage'));

export const DeedViewerPage = lazy(() => import('../pages/viewer/DeedViewerPage'));

export const GlobalSearchPage = lazy(() => import('../pages/search/GlobalSearchPage'));

export const NotaryListPage = lazy(() => import('../pages/notary/NotaryListPage'));

export const StatsPage = lazy(() => import('../pages/stats/StatsPage'));

export const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));