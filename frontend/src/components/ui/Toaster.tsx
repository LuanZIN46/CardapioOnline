import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { create } from 'zustand';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, tone = 'success') =>
    set((state) => ({ toasts: [...state.toasts, { id: Date.now() + Math.random(), message, tone }] })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export function toast(message: string, tone: ToastTone = 'success') {
  useToastStore.getState().push(message, tone);
}

const TONE_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const TONE_STYLES = {
  success: 'border-emerald-500/40 text-emerald-300',
  error: 'border-red-500/40 text-red-300',
  info: 'border-brand-gold/40 text-brand-gold',
} as const;

function ToastCard({ toast: item }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = TONE_ICONS[item.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), 3200);
    return () => window.clearTimeout(timer);
  }, [item.id, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border bg-surface-raised px-4 py-3 text-sm font-medium shadow-card ${TONE_STYLES[item.tone]}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="text-brand-white">{item.message}</span>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] mx-auto flex max-w-sm flex-col gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
