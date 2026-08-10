import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
      {children}
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
    <div className={`card ${className}`}>
      {title && <div className="card-header"><h3>{title}</h3></div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'badge-success',
  PENDING: 'badge-warning',
  SUSPENDED: 'badge-danger',
  INACTIVE: 'badge-secondary',
  REJECTED: 'badge-danger',
  REGISTERED: 'badge-success',
  EXPIRED: 'badge-secondary',
  SUBMITTED: 'badge-info',
  ACKNOWLEDGED: 'badge-primary',
  DRAFT: 'badge-secondary',
  DAYBOOK_ENTERED: 'badge-info',
  FOLIO_CREATED: 'badge-info',
  FOLIO_SUBMITTED: 'badge-info',
  SCAN_UPLOADED: 'badge-info',
  PENDING_CORRECTION: 'badge-warning',
  SUPERSEDED: 'badge-secondary',
  SUSPICIOUS_FLAGGED: 'badge-danger',
  REPORTED: 'badge-danger',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'badge-secondary';
  return <span className={`badge ${colorClass}`}>{status}</span>;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return <div className={`spinner spinner-${size}`} />;
}

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p>{message}</p>
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
