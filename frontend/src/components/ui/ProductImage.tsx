import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

/** Imagem com lazy loading e fallback elegante quando a URL falha. */
export function ProductImage({ src, alt, className, eager = false }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-surface-muted to-black',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="h-8 w-8 text-brand-gold/40" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
