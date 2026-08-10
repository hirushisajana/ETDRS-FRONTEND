import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { getDashboardPath } from '../../lib/auth-utils';

export default function DashboardRedirect() {
  const { user } = useAuth();
  const path = user ? getDashboardPath(user.role) : '/dashboard/super-admin';
  return <Navigate to={path} replace />;
}
