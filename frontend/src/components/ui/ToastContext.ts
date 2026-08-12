import { createContext } from 'react';
import type { ToastVariant } from './Toast';

export interface ToastContextValue {
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
