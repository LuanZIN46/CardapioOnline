import { useState } from 'react';
import { cn } from '@/lib/cn';

interface LogoProps {
  src: string;
  name: string;
  className?: string;
}

/**
 * Mostra a logo do estabelecimento e cai para o selo com as iniciais
 * enquanto o arquivo não estiver disponível em `public/`.
 */
export function Logo({ src, name, className }: LogoProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter((word) => word.length > 2)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (failed) {
    return (
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-xl bg-brand-gold font-black text-brand-black',
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo do ${name}`}
      onError={() => setFailed(true)}
      className={cn('rounded-xl object-contain', className)}
    />
  );
}
