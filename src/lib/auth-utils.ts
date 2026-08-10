import type { UserRole } from '../types';

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'IT_ADMIN':
    case 'SUPER_ADMIN':
      return '/dashboard/super-admin';
    case 'HEAD_OFFICE':
      return '/dashboard/head-office';
    case 'REGISTRY_ADMIN':
      return '/dashboard/registry';
    case 'COUNTER_USER':
      return '/daybook/counter';
    case 'DAYBOOK_USER':
      return '/daybook/pending';
    case 'FOLIO_USER':
      return '/folio';
    default:
      return '/dashboard/super-admin';
  }
}

export function canAccess(role: UserRole, path: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    '/dashboard/super-admin': ['IT_ADMIN', 'SUPER_ADMIN'],
    '/dashboard/head-office': ['HEAD_OFFICE'],
    '/dashboard/registry': ['REGISTRY_ADMIN'],
    '/registries': ['IT_ADMIN'],
    '/users': ['IT_ADMIN'],
    '/notaries': ['IT_ADMIN', 'SUPER_ADMIN'],
    '/daybook/counter': ['COUNTER_USER', 'REGISTRY_ADMIN'],
    '/daybook/pending': ['DAYBOOK_USER', 'REGISTRY_ADMIN'],
    '/folio': ['FOLIO_USER', 'REGISTRY_ADMIN'],
    '/approval': ['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN'],
    '/scan': ['REGISTRY_ADMIN'],
    '/staff': ['REGISTRY_ADMIN'],
    '/certificates': ['IT_ADMIN', 'SUPER_ADMIN', 'REGISTRY_ADMIN'],
    '/suspicious': ['IT_ADMIN', 'HEAD_OFFICE', 'SUPER_ADMIN', 'REGISTRY_ADMIN'],
    '/stats': ['IT_ADMIN', 'SUPER_ADMIN', 'HEAD_OFFICE'],
  };

  const allowed = permissions[path];
  if (!allowed) return true;
  return allowed.includes(role);
}
