import { createContext } from 'react';

export interface ToastData {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
}

export interface ToastContextValue {
  readonly showToast: (title: string, description?: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
