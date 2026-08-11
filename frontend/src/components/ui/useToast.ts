import { useState, useCallback } from 'react';
import type { ToastData, ToastVariant } from './Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const push = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, push, dismiss };
}
