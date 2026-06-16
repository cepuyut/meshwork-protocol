"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Bell, X } from "lucide-react";

type ToastType = "pending" | "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  txHash?: string;
}

interface ToastCtx {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => string;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts((p) => [...p, { ...t, id }]);
    return id;
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
    setToasts((p) => p.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastType, ReactNode> = {
  pending: <Loader2 size={16} className="animate-spin text-blue" />,
  success: <CheckCircle size={16} className="text-green" />,
  error: <XCircle size={16} className="text-red" />,
  info: <Bell size={16} className="text-amber" />,
};

const bgMap: Record<ToastType, string> = {
  pending: "border-blue/30 bg-blue-soft",
  success: "border-green/30 bg-[#e4f0e8]",
  error: "border-red/30 bg-[#fbe2dc]",
  info: "border-amber/30 bg-[#f6efe0]",
};

function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2.5 max-w-[380px]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg ${bgMap[t.type]}`}
          >
            <div className="mt-0.5 shrink-0">{iconMap[t.type]}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink">{t.title}</div>
              {t.message && <div className="mt-0.5 text-[12px] text-ink-dim">{t.message}</div>}
              {t.txHash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${t.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-mono text-[10.5px] text-blue underline"
                >
                  view on ArcScan
                </a>
              )}
            </div>
            <button onClick={() => dismissToast(t.id)} className="shrink-0 text-ink-faint hover:text-ink">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}