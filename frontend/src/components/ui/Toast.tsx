import { useEffect } from 'react';
import './Toast.css';

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastItemProps extends ToastData {
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastVariant, string> = {
  success: '✓',
  warning: '⚠',
  danger:  '✕',
  info:    'ℹ',
};

function ToastItem({ id, message, variant = 'info', onDismiss }: ToastItemProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div className={`toast toast--${variant}`} role="alert" aria-live="assertive">
      <span className="toast__icon" aria-hidden="true">{ICONS[variant]}</span>
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" onClick={() => onDismiss(id)} aria-label="Dismiss">✕</button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
