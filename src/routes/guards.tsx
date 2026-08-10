import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { getDashboardPath } from '../lib/auth-utils';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !hasRole(...roles)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user ? getDashboardPath(user.role) : '/dashboard/super-admin'} replace />;
  }

  return <>{children}</>;
}

export function PublicPortalRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('public_auth_token');
  if (!token) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
}
