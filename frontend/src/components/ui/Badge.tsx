import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import type { ProductBadge } from '@/types';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
  {
    variants: {
      variant: {
        novo: 'bg-emerald-500/15 text-emerald-400',
        promocao: 'bg-brand-gold text-brand-black',
        'mais-vendido': 'bg-orange-500/15 text-orange-400',
        neutral: 'bg-white/10 text-brand-white/80',
        danger: 'bg-red-500/15 text-red-400',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export const BADGE_LABELS: Record<ProductBadge, string> = {
  novo: 'Novo',
  promocao: 'Promoção',
  'mais-vendido': 'Mais vendido',
};

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
