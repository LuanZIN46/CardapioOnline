import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-brand-gold text-brand-black shadow-gold hover:bg-gold-300',
        secondary:
          'border border-surface-border bg-surface-raised text-brand-white hover:border-brand-gold/60 hover:text-brand-gold',
        ghost: 'text-brand-white/70 hover:bg-white/5 hover:text-brand-white',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
        whatsapp: 'bg-[#25D366] text-white hover:bg-[#1eb955]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-10 w-10',
      },
      full: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, loading, children, disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, full }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
