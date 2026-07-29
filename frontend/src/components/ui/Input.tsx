import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const fieldStyles =
  'w-full rounded-xl border border-surface-border bg-surface-muted px-4 py-3 text-sm text-brand-white placeholder:text-brand-white/35 transition-colors focus:border-brand-gold focus:outline-none disabled:opacity-60';

interface FieldWrapperProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ id, label, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-brand-white/60">
          {label}
          {required && <span className="ml-1 text-brand-gold">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-brand-white/40">{hint}</p>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <FieldWrapper id={fieldId} label={label} error={error} hint={hint} required={required}>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(fieldStyles, error && 'border-red-500/60', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <FieldWrapper id={fieldId} label={label} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(fieldStyles, 'min-h-[88px] resize-y', error && 'border-red-500/60', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

Textarea.displayName = 'Textarea';
