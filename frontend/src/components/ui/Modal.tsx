import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ModalVariant = 'drawer' | 'sheet';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: ModalVariant;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const variantMotion = {
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    className:
      'ml-auto h-full w-full max-w-md rounded-none sm:rounded-l-3xl border-l border-surface-border',
  },
  sheet: {
    initial: { y: '100%', opacity: 0.6 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0.6 },
    className:
      'mt-auto h-[92vh] w-full rounded-t-3xl border-t border-surface-border sm:mx-auto sm:my-auto sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl sm:border',
  },
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  variant = 'sheet',
  children,
  footer,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const motionProps = variantMotion[variant];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-50 flex"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              'relative z-10 flex w-full flex-col bg-surface-raised shadow-sheet focus:outline-none',
              motionProps.className,
              className,
            )}
            initial={motionProps.initial}
            animate={motionProps.animate}
            exit={motionProps.exit}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-bold text-brand-white">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-brand-white/50">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-full p-2 text-brand-white/60 transition-colors hover:bg-white/10 hover:text-brand-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

            {footer && (
              <footer className="safe-bottom border-t border-surface-border bg-surface-raised px-5 pt-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
