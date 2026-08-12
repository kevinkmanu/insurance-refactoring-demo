import './StatusBadge.css';

interface Props {
  status: string;
  label?: string;
}

const STATUS_LABELS: Record<string, string> = {
  active:    'Active',
  pending:   'Pending',
  cancelled: 'Cancelled',
  expired:   'Expired',
  approved:  'Approved',
  rejected:  'Rejected',
  open:      'Open',
  closed:    'Closed',
  paid:      'Paid',
  overdue:   'Overdue',
};

const STATUS_VARIANT: Record<string, string> = {
  active:    'success',
  approved:  'success',
  paid:      'success',
  closed:    'success',
  pending:   'warning',
  open:      'warning',
  expired:   'neutral',
  cancelled: 'danger',
  rejected:  'danger',
  overdue:   'danger',
};

export function StatusBadge({ status, label }: Props) {
  const normalized = status.toLowerCase().replace(/[\s-]+/g, '_');
  const variant = STATUS_VARIANT[normalized] ?? (normalized.includes('review') || normalized.includes('refer') ? 'warning' : 'neutral');
  const displayLabel = label ?? STATUS_LABELS[normalized] ?? status.replace(/_/g, ' ');
  return (
    <span
      className={`status-badge status-badge--${variant}`}
      role="status"
      aria-label={displayLabel}
    >
      {displayLabel}
    </span>
  );
}
