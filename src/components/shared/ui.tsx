import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2">{actions}{children}</div>
      )}
    </div>
  );
}

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  SUSPENDED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  REJECTED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  REGISTERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  EXPIRED: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  SUBMITTED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  ACKNOWLEDGED: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  DRAFT: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  DAYBOOK_ENTERED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  FOLIO_CREATED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  FOLIO_SUBMITTED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  SCAN_UPLOADED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  PENDING_CORRECTION: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  SUPERSEDED: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  SUSPICIOUS_FLAGGED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  REPORTED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-12 w-12 border-4' : 'h-8 w-8 border-4';
  return (
    <div className={`mx-auto my-10 ${sizeClass} animate-spin rounded-full border-slate-200 border-t-blue-600`} />
  );
}

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const confirmColors: Record<string, string> = {
  danger: 'bg-rose-600 hover:bg-rose-500',
  warning: 'bg-amber-600 hover:bg-amber-500',
  info: 'bg-blue-600 hover:bg-blue-500',
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] ${confirmColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}