import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { ProtectedRoute, PublicPortalRoute } from './guards';
import type { UserRole } from '../types';
import {
  LandingPage,
  LoginPage,
  ActivatePage,
  ForgotPasswordPage,
  RegisterOrSignInPage,
  PublicForgotPasswordPage,
  PublicResetPasswordPage,
  PublicPortalHome,
  PublicTrustDetailPage,
  DashboardPage,
  RegistryDashboardPage,
  DashboardRedirect,
  RegistryListPage,
  RegistryFormPage,
  InviteReviewPage,
  UserListPage,
  UserFormPage,
  CounterPage,
  CounterHandoverPage,
  RecentEntriesPage,
  RejectedDeedsPage,
  CompletedHandoversPage,
  DaybookPendingPage,
  DaybookListPage,
  DaybookDetailPage,
  FolioListPage,
  FolioFormPage,
  FolioDetailPage,
  FolioAdminListPage,
  FolioAdminDetailPage,
  FolioChainViewPage,
  MyFoliosPage,
  ReportedDeedsPage,
  ApprovalPage,
  SignatureSetupPage,
  ScanPage,
  CertificateListPage,
  SuspiciousListPage,
  StaffListPage,
  StaffFormPage,
  StaffInviteReviewPage,
  DeedViewerPage,
  GlobalSearchPage,
  NotaryListPage,
  StatsPage,
  NotFoundPage,
} from './lazy';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/activate/:token',
    element: <ActivatePage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/register',
    element: <RegisterOrSignInPage />,
  },
  {
    path: '/portal/forgot-password',
    element: <PublicForgotPasswordPage />,
  },
  {
    path: '/portal/reset-password',
    element: <PublicResetPasswordPage />,
  },
  {
    path: '/portal',
    element: (
      <PublicPortalRoute>
        <PublicPortalHome />
      </PublicPortalRoute>
    ),
  },
  {
    path: '/portal/trust/:folioId',
    element: (
      <PublicPortalRoute>
        <PublicTrustDetailPage />
      </PublicPortalRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN', 'HEAD_OFFICE', 'REGISTRY_ADMIN', 'COUNTER_USER', 'DAYBOOK_USER', 'FOLIO_USER'] as UserRole[]}>
        <AppLayout><DashboardRedirect /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/super-admin',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><DashboardPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/super-admin/registries',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/super-admin/registries/new',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/super-admin/registries/new/review',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><InviteReviewPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/head-office',
    element: (
      <ProtectedRoute roles={['HEAD_OFFICE'] as UserRole[]}>
        <AppLayout><DashboardPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/registry',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryDashboardPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/registries',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/registries/new',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/registries/:id/edit',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><RegistryFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><UserListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/new',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><UserFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/counter',
    element: (
      <ProtectedRoute roles={['COUNTER_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><CounterPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/handover',
    element: (
      <ProtectedRoute roles={['COUNTER_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><CounterHandoverPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/handover/history',
    element: (
      <ProtectedRoute roles={['COUNTER_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><CompletedHandoversPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/recent',
    element: (
      <ProtectedRoute roles={['COUNTER_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><RecentEntriesPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/rejected',
    element: (
      <ProtectedRoute roles={['COUNTER_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><RejectedDeedsPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/pending',
    element: (
      <ProtectedRoute roles={['DAYBOOK_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><DaybookPendingPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/list',
    element: (
      <ProtectedRoute roles={['DAYBOOK_USER', 'REGISTRY_ADMIN', 'COUNTER_USER'] as UserRole[]}>
        <AppLayout><DaybookListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/daybook/:id',
    element: (
      <ProtectedRoute roles={['DAYBOOK_USER', 'REGISTRY_ADMIN', 'COUNTER_USER'] as UserRole[]}>
        <AppLayout><DaybookDetailPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><FolioListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/:id/entry',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><FolioFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/:id',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><FolioDetailPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/admin',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><FolioAdminListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/admin/:id',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN', 'FOLIO_USER'] as UserRole[]}>
        <AppLayout><FolioAdminDetailPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/records',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN', 'FOLIO_USER'] as UserRole[]}>
        <AppLayout><ReportedDeedsPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/my',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><MyFoliosPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/folio/:id/chain',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><FolioChainViewPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/deed-viewer/:folioId',
    element: (
      <ProtectedRoute roles={['FOLIO_USER', 'REGISTRY_ADMIN', 'DAYBOOK_USER'] as UserRole[]}>
        <AppLayout><DeedViewerPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/approval',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><ApprovalPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/signature',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><SignatureSetupPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/scan',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><ScanPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/certificates',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><CertificateListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/suspicious',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN', 'HEAD_OFFICE', 'REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><SuspiciousListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><StaffListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/new',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><StaffFormPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/:id/review',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><StaffInviteReviewPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/search',
    element: (
      <ProtectedRoute roles={['REGISTRY_ADMIN'] as UserRole[]}>
        <AppLayout><GlobalSearchPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/notaries',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN'] as UserRole[]}>
        <AppLayout><NotaryListPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/stats',
    element: (
      <ProtectedRoute roles={['IT_ADMIN', 'SUPER_ADMIN', 'HEAD_OFFICE'] as UserRole[]}>
        <AppLayout><StatsPage /></AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
