'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from '@/components/ui/Toast/style.module.scss';

type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Errors stay a little longer by default. */
  duration?: number;
}

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  leaving: boolean;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const EXIT_MS = 180;
const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timers.current.delete(id);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimeout(timers.current.get(id));
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      timers.current.set(id, setTimeout(() => remove(id), EXIT_MS));
    },
    [remove]
  );

  const toast = useCallback(
    ({ title, description, variant = 'info', duration }: ToastOptions) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant, leaving: false }]);
      const delay = duration ?? (variant === 'error' ? 6000 : 3500);
      timers.current.set(id, setTimeout(() => dismiss(id), delay));
    },
    [dismiss]
  );

  // Clear pending timers on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <section className={styles.viewport} aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === 'error' ? 'alert' : 'status'}
              className={`${styles.toast} ${styles[t.variant]} ${t.leaving ? styles.leaving : ''}`}
            >
              <Icon size={15} strokeWidth={1.75} className={styles.icon} aria-hidden="true" />
              <div className={styles.body}>
                <p className={styles.title}>{t.title}</p>
                {t.description && <p className={styles.description}>{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className={styles.close}
                aria-label="Dismiss notification"
              >
                <X size={13} strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </section>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
