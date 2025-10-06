'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastState = {
  toasts: Toast[];
};

type ToastActions = {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
};

const ToastStateContext = createContext<ToastState | undefined>(undefined);
const ToastActionsContext = createContext<ToastActions | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('success', title, message, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('error', title, message, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('info', title, message, duration);
    },
    [showToast]
  );

  const state = { toasts };
  const actions = { showToast, removeToast, success, error, info };

  return (
    <ToastStateContext.Provider value={state}>
      <ToastActionsContext.Provider value={actions}>
        {children}
        <ToastContainer />
      </ToastActionsContext.Provider>
    </ToastStateContext.Provider>
  );
}

function ToastContainer() {
  const state = useContext(ToastStateContext);
  const actions = useContext(ToastActionsContext);

  if (!state || !actions) {
    throw new Error('ToastContainer must be used within ToastProvider');
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => actions.removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const bgColor = (() => {
    if (toast.type === 'success') return 'bg-green-500';
    if (toast.type === 'error') return 'bg-red-500';
    return 'bg-blue-500';
  })();

  const Icon = (() => {
    if (toast.type === 'success') return CheckCircle;
    if (toast.type === 'error') return AlertCircle;
    return Info;
  })();

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-start space-x-3 animate-slide-in-right`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-90 mt-1">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const actions = useContext(ToastActionsContext);
  if (actions === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return actions;
}

export function useToastState() {
  const state = useContext(ToastStateContext);
  if (state === undefined) {
    throw new Error('useToastState must be used within a ToastProvider');
  }
  return state;
}

