import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContainer, type ToastData, type ToastVariant } from './Toast';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const push = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, variant }]);
  }, []);
  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const value = useMemo(() => ({ push, dismiss }), [dismiss, push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
