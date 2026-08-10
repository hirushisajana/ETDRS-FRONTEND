import type { UserRole } from './enums';

export interface SidebarItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  children?: SidebarItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
