"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ open, title, message, confirmLabel, variant = "primary", onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0E1116]/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 mx-4 w-full max-w-[400px] rounded-2xl border border-line bg-surface p-6 shadow-xl"
          >
            {variant === "danger" && (
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#fbe2dc]">
                <AlertTriangle size={20} className="text-red" />
              </div>
            )}
            <h3 className="text-center text-[16px] font-bold">{title}</h3>
            <p className="mt-2 text-center text-[13.5px] text-ink-dim">{message}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-[11px] border border-line-2 bg-surface py-2.5 text-[14px] font-semibold text-ink-dim"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-[11px] px-5 py-2.5 text-[14px] font-semibold text-white ${
                  variant === "danger" ? "bg-red" : "bg-blue"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}